import React, { useState } from 'react';
import './Payment.css';

interface ReservationData {
  date: string;
  time: string;
  duration: number;
  price: number;
}

const Payment: React.FC = () => {
  const [reservationData, setReservationData] = useState<ReservationData>({
    date: '',
    time: '',
    duration: 30,
    price: 0
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | ''>('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const calculatePrice = (duration: number) => {
    const basePrice = 100; // CZK per 30 minutes
    return (duration / 30) * basePrice;
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const duration = parseInt(e.target.value);
    setReservationData({
      ...reservationData,
      duration,
      price: calculatePrice(duration)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would integrate with a real payment gateway
    alert('Rezervace a platba byla úspěšně zpracována!');
  };

  return (
    <div className="payment-reservation">
      <h2>Rezervace a platba</h2>

      <form onSubmit={handleSubmit}>
        <div className="reservation-section">
          <h3>Detaily rezervace</h3>
          
          <div className="form-group">
            <label htmlFor="date">Datum:</label>
            <input
              type="date"
              id="date"
              value={reservationData.date}
              onChange={(e) => setReservationData({ ...reservationData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Čas:</label>
            <input
              type="time"
              id="time"
              value={reservationData.time}
              onChange={(e) => setReservationData({ ...reservationData, time: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Doba pronájmu:</label>
            <select
              id="duration"
              value={reservationData.duration}
              onChange={handleDurationChange}
              required
            >
              <option value="30">30 minut</option>
              <option value="60">1 hodina</option>
              <option value="90">1.5 hodiny</option>
              <option value="120">2 hodiny</option>
            </select>
          </div>

          <div className="price-display">
            <strong>Celková cena:</strong> {reservationData.price} CZK
          </div>
        </div>

        <div className="payment-section">
          <h3>Platební metoda</h3>
          
          <div className="payment-methods">
            <label className={paymentMethod === 'card' ? 'selected' : ''}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                required
              />
              Kreditní/Debetní karta
            </label>

            <label className={paymentMethod === 'paypal' ? 'selected' : ''}>
              <input
                type="radio"
                name="payment"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={() => setPaymentMethod('paypal')}
                required
              />
              PayPal
            </label>
          </div>

          {paymentMethod === 'card' && (
            <div className="card-details">
              <div className="form-group">
                <label htmlFor="cardNumber">Číslo karty:</label>
                <input
                  type="text"
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cardExpiry">Platnost:</label>
                  <input
                    type="text"
                    id="cardExpiry"
                    placeholder="MM/RR"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength={5}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardCvc">CVC:</label>
                  <input
                    type="text"
                    id="cardCvc"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="paypal-info">
              <p>Budete přesměrováni na PayPal pro dokončení platby.</p>
            </div>
          )}
        </div>

        <button type="submit" className="submit-button">
          Potvrdit rezervaci a zaplatit
        </button>
      </form>
    </div>
  );
};

export default Payment;
