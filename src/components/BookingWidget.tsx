import React, { useState } from 'react';
import { DateRange, RangeKeyDict } from 'react-date-range';
import { format } from 'date-fns';
import { Calendar, Users, ChevronDown } from 'lucide-react';
import { Button } from './UI';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../contexts/CurrencyContext';

interface BookingWidgetProps {
  pricePerNight: number;
  dates: any[];
  onDateChange: (item: RangeKeyDict) => void;
  guestCount: number;
  onGuestChange: (count: number) => void;
  onBook: () => void;
  isBooking: boolean;
  extraServices?: { label: string; price: number }[];
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  pricePerNight,
  dates,
  onDateChange,
  guestCount,
  onGuestChange,
  onBook,
  isBooking,
  extraServices = []
}) => {
  const { formatPrice } = useCurrency();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const nightsCount = Math.max(1, Math.ceil((dates[0].endDate.getTime() - dates[0].startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const basePrice = pricePerNight * nightsCount;
  const totalPrice = basePrice;

  return (
    <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-xl w-full">
      <div className="mb-6">
        <p className="text-sm font-medium text-neutral-500 mb-1">Starting from</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#1e293b]">{formatPrice(pricePerNight)}</span>
          <span className="text-sm font-medium text-neutral-500">/ night</span>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-neutral-200 overflow-hidden divide-y divide-neutral-200">
        <div 
          className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-neutral-50"
          onClick={() => {
            setShowDatePicker(!showDatePicker);
            setShowGuestPicker(false);
          }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Check in / out</p>
            <p className="mt-1 text-sm font-bold text-[#1e293b]">
              {format(dates[0].startDate, 'MMM dd')} - {format(dates[0].endDate, 'MMM dd')}
            </p>
          </div>
          <Calendar className="h-5 w-5 text-neutral-400" />
        </div>
        
        <div 
          className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-neutral-50"
          onClick={() => {
            setShowGuestPicker(!showGuestPicker);
            setShowDatePicker(false);
          }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Guests</p>
            <p className="mt-1 text-sm font-bold text-[#1e293b]">{guestCount} Guests</p>
          </div>
          <Users className="h-5 w-5 text-neutral-400" />
        </div>
      </div>

      <AnimatePresence>
        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden rounded-2xl border border-neutral-100 shadow-sm"
          >
            <DateRange
              editableDateInputs={true}
              onChange={onDateChange}
              moveRangeOnFirstSelection={false}
              ranges={dates}
              minDate={new Date()}
              rangeColors={['#fbbf24']}
              showMonthAndYearPickers={false}
              months={1}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGuestPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#1e293b]">Adults & Children</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onGuestChange(Math.max(1, guestCount - 1))}
                  disabled={guestCount <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-600 disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-4 text-center font-bold">{guestCount}</span>
                <button
                  type="button"
                  onClick={() => onGuestChange(guestCount + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-600"
                >
                  +
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 mb-6 text-sm text-neutral-600">
        <div className="flex justify-between">
          <span className="underline decoration-neutral-300 underline-offset-4">{formatPrice(pricePerNight)} x {nightsCount} nights</span>
          <span>{formatPrice(basePrice)}</span>
        </div>
        <div className="flex justify-between border-t border-neutral-100 pt-4 font-bold text-[#1e293b] text-base">
          <span>Total estimated value</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <Button
        className="w-full h-14 bg-[#fbbf24] text-[#1e293b] font-bold text-lg rounded-2xl hover:bg-[#1e293b] hover:text-white transition-all shadow-lg"
        onClick={onBook}
        disabled={isBooking}
      >
        {isBooking ? 'Processing...' : 'Request to Book'}
      </Button>
      
      <p className="mt-4 text-center text-xs font-medium italic text-neutral-500">You won't be charged yet</p>
    </div>
  );
};
