<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function account(string $type): User
    {
        $user = User::factory()->create([
            'user_type' => $type,
            'status' => 'active',
            'is_blocked' => false,
        ]);

        $user->syncRoles($type === 'seller' ? ['user', 'seller'] : [$type]);

        return $user;
    }

    public function test_public_registration_cannot_assign_privileged_roles(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Customer',
            'email' => 'customer@example.test',
            'password' => 'StrongPass123!',
            'password_confirmation' => 'StrongPass123!',
            'user_type' => 'super_admin',
            'role' => 'admin',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.user_type', 'user');

        $this->assertDatabaseHas('users', [
            'email' => 'customer@example.test',
            'user_type' => 'user',
        ]);
    }

    public function test_customer_cannot_access_admin_or_super_admin_apis(): void
    {
        Sanctum::actingAs($this->account('user'));

        $this->getJson('/api/admin/dashboard')->assertForbidden();
        $this->getJson('/api/super-admin/dashboard')->assertForbidden();
    }

    public function test_admin_can_access_admin_api_but_not_platform_api(): void
    {
        Sanctum::actingAs($this->account('admin'));

        $this->getJson('/api/admin/dashboard')->assertOk();
        $this->getJson('/api/super-admin/dashboard')->assertForbidden();
    }

    public function test_super_admin_can_access_admin_and_platform_apis(): void
    {
        Sanctum::actingAs($this->account('super_admin'));

        $this->getJson('/api/admin/dashboard')->assertOk();
        $this->getJson('/api/super-admin/dashboard')->assertOk();
    }

    public function test_customer_cannot_read_another_customers_order(): void
    {
        $owner = $this->account('user');
        $other = $this->account('user');
        $address = Address::create([
            'user_id' => $owner->id,
            'address_line_1' => '1 Main Street',
            'city' => 'Jaipur',
            'state' => 'Rajasthan',
            'zip_code' => '302001',
            'country' => 'India',
        ]);
        $order = Order::create([
            'user_id' => $owner->id,
            'address_id' => $address->id,
            'total_amount' => 499,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        Sanctum::actingAs($other);
        $this->getJson('/api/orders/' . $order->id)->assertForbidden();
    }

    public function test_blocked_account_cannot_login(): void
    {
        $user = User::factory()->create([
            'email' => 'blocked@example.test',
            'password' => bcrypt('StrongPass123!'),
            'user_type' => 'user',
            'status' => 'active',
            'is_blocked' => true,
        ]);
        $user->assignRole('user');

        $this->postJson('/api/login', [
            'email' => 'blocked@example.test',
            'password' => 'StrongPass123!',
        ])->assertForbidden();
    }
}
