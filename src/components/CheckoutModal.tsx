import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Truck,
  CheckCircle,
  ShieldCheck,
  Building,
  User,
  MapPin,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { CartItem, Order, UserProfile } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentUser: UserProfile;
  onOrderPlaced: (order: Order) => void;
  onViewOrdersInDashboard: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  onOrderPlaced,
  onViewOrdersInDashboard,
}) => {
  const [fullName, setFullName] = useState(currentUser.name);
  const [street, setStreet] = useState('742 Evergreen Terrace, Suite 4B');
  const [city, setCity] = useState('Portland');
  const [state, setState] = useState('OR');
  const [zip, setZip] = useState('97201');
  const [paymentType, setPaymentType] = useState<'card' | 'hsa'>('card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('883');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 6.95;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const newOrder: Order = {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toISOString().split('T')[0],
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.image,
        })),
        subtotal,
        shipping,
        tax,
        total,
        status: 'Processing',
        trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}US`,
        shippingAddress: {
          fullName,
          street,
          city,
          state,
          zip,
        },
      };

      setConfirmedOrder(newOrder);
      onOrderPlaced(newOrder);
      setIsProcessing(false);
    }, 600);
  };

  const handleReset = () => {
    setConfirmedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmedOrder ? (
          <form onSubmit={handlePlaceOrder} className="flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Checkout</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Medical Supplies Order</h3>
              <p className="text-xs text-slate-500">
                Confirm your delivery destination and payment details.
              </p>
            </div>

            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Shipping Address */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  <span>1. Delivery Address</span>
                </h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-slate-600 block mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-slate-600 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Zip</label>
                      <input
                        type="text"
                        required
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:border-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-teal-700" />
                  <span>2. Payment Option</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('card')}
                    className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                      paymentType === 'card'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('hsa')}
                    className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                      paymentType === 'hsa'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    HSA / FSA Card
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <label className="text-slate-500 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-1">Exp Date</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">CVC</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Breakdown */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Items Subtotal ({items.length})</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Sales Tax (8%)</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-bold text-slate-900">
                  <span>Final Total</span>
                  <span className="tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Encrypted Demo Order</span>
              </span>

              <button
                type="submit"
                disabled={isProcessing}
                className="py-2.5 px-6 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{isProcessing ? 'Authorizing...' : `Place Order · $${total.toFixed(2)}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-500">
                Order ID: <span className="font-mono text-slate-800 font-semibold">{confirmedOrder.id}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Tracking Code:</span>
                <span className="font-mono text-slate-800">{confirmedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-teal-700">{confirmedOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Charged:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ${confirmedOrder.total.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                Delivering to: {confirmedOrder.shippingAddress.fullName}, {confirmedOrder.shippingAddress.street}, {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} {confirmedOrder.shippingAddress.zip}
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  handleReset();
                  onViewOrdersInDashboard();
                }}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
              >
                View in Patient Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
