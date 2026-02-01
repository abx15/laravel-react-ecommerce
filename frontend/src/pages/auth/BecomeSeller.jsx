import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api'; // Assuming we have an axios instance configuration
import { useAuth } from '../../context/AuthContext';

// Simple API wrapper if services/api.js is not fully set up 
// tailored for FormData which needs special headers handling usually handled by browser or instance


const BecomeSeller = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        shop_name: '',
        shop_address: '',
        city: '',
        pincode: '',
        gst_number: '',
        // Bank Details
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
        bank_name: '',
    });

    const [idProof, setIdProof] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setIdProof(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!idProof) {
            setError('Please upload an ID proof document.');
            setLoading(false);
            return;
        }

        const data = new FormData();
        // Shop Details
        data.append('shop_name', formData.shop_name);
        data.append('shop_address', formData.shop_address);
        data.append('city', formData.city);
        data.append('pincode', formData.pincode);
        if (formData.gst_number) data.append('gst_number', formData.gst_number);

        // ID Proof
        data.append('id_proof', idProof);

        // Bank Details (Flat for form, backend expects array)
        // Since backend expects Validated Array: bank_details[key]
        data.append('bank_details[account_holder_name]', formData.account_holder_name);
        data.append('bank_details[account_number]', formData.account_number);
        data.append('bank_details[ifsc_code]', formData.ifsc_code);
        data.append('bank_details[bank_name]', formData.bank_name);

        try {
            const response = await api.post('/seller/register', data);

            if (response.status === 201) {
                alert('Success! Your seller request is pending approval.');
                navigate('/profile');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Something went wrong. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-background">
            <div className="bg-card rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-text-heading">Become a Seller</h1>
                    <p className="text-text-muted mt-2">Start selling your products on our platform today.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-status-error p-4 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Shop Details Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-primary-dark border-b pb-2">Shop Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                id="shop_name"
                                name="shop_name"
                                label="Shop Name"
                                placeholder="My Grocery Store"
                                value={formData.shop_name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                id="gst_number"
                                name="gst_number"
                                label="GST Number (Optional)"
                                placeholder="GSTIN..."
                                value={formData.gst_number}
                                onChange={handleChange}
                            />
                        </div>
                        <Input
                            id="shop_address"
                            name="shop_address"
                            label="Shop Address"
                            placeholder="123 Market Street"
                            value={formData.shop_address}
                            onChange={handleChange}
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                id="city"
                                name="city"
                                label="City"
                                placeholder="Mumbai"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                id="pincode"
                                name="pincode"
                                label="Pincode"
                                placeholder="400001"
                                value={formData.pincode}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Bank Details Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-primary-dark border-b pb-2">Bank Details</h2>
                        <Input
                            id="account_holder_name"
                            name="account_holder_name"
                            label="Account Holder Name"
                            placeholder="As per bank records"
                            value={formData.account_holder_name}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            id="account_number"
                            name="account_number"
                            label="Account Number"
                            placeholder="1234567890"
                            value={formData.account_number}
                            onChange={handleChange}
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                id="ifsc_code"
                                name="ifsc_code"
                                label="IFSC Code"
                                placeholder="ABCD0123456"
                                value={formData.ifsc_code}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                id="bank_name"
                                name="bank_name"
                                label="Bank Name"
                                placeholder="State Bank of India"
                                value={formData.bank_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-primary-dark border-b pb-2">Documents</h2>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-heading">ID Proof (PDF/Image)</label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-text-muted
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-primary/10 file:text-primary
                                  hover:file:bg-primary/20
                                "
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full text-lg py-3" disabled={loading}>
                            {loading ? 'Submitting Application...' : 'Submit Application'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BecomeSeller;
