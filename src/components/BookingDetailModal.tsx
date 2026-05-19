import React from 'react';
import { Card, Button } from './UI';
import { X, Mail, Phone, MessageSquare } from 'lucide-react';

export const BookingDetailModal: React.FC<{ booking: any, onClose: () => void }> = ({ booking, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <Card className="max-w-lg w-full p-6 bg-[#1e293b] border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Booking Details #{booking.reference}</h2>
                    <button onClick={onClose} className="text-white hover:text-neutral-400" aria-label="Close"><X /></button>
                </div>
                <div className="space-y-4 text-white">
                    <p><strong>Property:</strong> {booking.itemName}</p>
                    <p><strong>Dates:</strong> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                    <p><strong>Total Price:</strong> {booking.totalPrice}</p>
                    <p><strong>Status:</strong> {booking.status}</p>
                    <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
                        <h3 className="font-bold">Contact Host</h3>
                        <div className="flex gap-2">
                           <Button size="sm" variant="outline" onClick={() => window.open(`mailto:host@example.com`)}><Mail className="h-4 w-4 mr-2"/>Email</Button>
                           <Button size="sm" variant="outline" onClick={() => window.open(`tel:+390811234567`)}><Phone className="h-4 w-4 mr-2"/>Call</Button>
                           <Button size="sm" variant="outline" onClick={() => window.open(`https://wa.me/390811234567`)}><MessageSquare className="h-4 w-4 mr-2"/>WhatsApp</Button>
                        </div>
                    </div>
                </div>
                <Button className="w-full mt-6" onClick={onClose}>Close</Button>
            </Card>
        </div>
    );
};
