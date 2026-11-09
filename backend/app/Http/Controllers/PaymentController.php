<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;

class PaymentController extends Controller
{
    use ApiResponse;

    public function verifyPayment(Request $request)
    {
        $validated = $request->validate([
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        $order = Order::where('razorpay_order_id', $validated['razorpay_order_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$order) {
            return $this->error('Order not found for this account.', 404);
        }

        if ($order->payment_status === 'paid') {
            return $this->success($order, 'Payment already verified');
        }

        if (!config('services.razorpay.key') || !config('services.razorpay.secret')) {
            return $this->error('Payment verification is not configured.', 503);
        }

        try {
            $api = new Api(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            );

            $api->utility->verifyPaymentSignature([
                'razorpay_order_id' => $validated['razorpay_order_id'],
                'razorpay_payment_id' => $validated['razorpay_payment_id'],
                'razorpay_signature' => $validated['razorpay_signature'],
            ]);

            $paymentDetails = $api->payment->fetch($validated['razorpay_payment_id']);

            if ((string) $paymentDetails->status !== 'captured') {
                return $this->error('Payment has not been captured yet. Please wait for confirmation.', 409);
            }

            if (
                (string) $paymentDetails->order_id !== $order->razorpay_order_id
                || (int) $paymentDetails->amount !== (int) round((float) $order->total_amount * 100)
                || strtoupper((string) $paymentDetails->currency) !== 'INR'
            ) {
                return $this->error('Payment details do not match this order.', 422);
            }

            DB::transaction(function () use ($order, $validated, $paymentDetails) {
                $lockedOrder = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();

                if ($lockedOrder->payment_status === 'paid') {
                    return;
                }

                Payment::firstOrCreate(
                    ['razorpay_payment_id' => $validated['razorpay_payment_id']],
                    [
                        'order_id' => $lockedOrder->id,
                        'razorpay_signature' => $validated['razorpay_signature'],
                        'amount' => $lockedOrder->total_amount,
                        'currency' => 'INR',
                        'status' => $paymentDetails->status === 'captured' ? 'captured' : 'authorized',
                        'method' => $paymentDetails->method ?? 'razorpay',
                    ]
                );

                $lockedOrder->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                ]);
            });

            return $this->success($order->fresh()->load('payment'), 'Payment verified successfully');
        } catch (SignatureVerificationError $e) {
            return $this->error('Payment signature verification failed.', 400);
        } catch (\Throwable $e) {
            report($e);

            return $this->error('Payment could not be verified. Please contact support if money was deducted.', 500);
        }
    }
}
