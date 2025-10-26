export default function PolicyPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-6"
      style={{ backgroundImage: "url('/images/bg.jpg')" }}
    >
      <div className="max-w-3xl w-full bg-black/80 backdrop-blur-md text-gray-100 shadow-2xl rounded-2xl p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Service Policy & Contract Agreement
        </h1>

        <p className="text-gray-300 mb-6 text-center">
          Please read this agreement carefully before proceeding with any
          service booking. By confirming your booking, you acknowledge and agree
          to the terms outlined below.
        </p>

        <section className="space-y-6 text-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-blue-400 mb-2">
              1. Booking Guidelines
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                All bookings must be made at least <b>24 hours in advance</b>.
              </li>
              <li>Event details (date, time, and venue) must be accurate.</li>
              <li>
                The client must ensure that all required services, equipment, and
                personnel are available before finalizing the booking.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-400 mb-2">
              2. Payment & Confirmation
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                A <b>down payment</b> is required to confirm the booking. Without
                payment, the booking will remain <b>pending</b>.
              </li>
              <li>
                Payment details and proof of payment must be submitted within the
                given timeframe.
              </li>
              <li>
                Failure to provide a down payment may result in automatic booking
                cancellation.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-400 mb-2">
              3. Cancellation Policy
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                Cancellations must be made at least <b>12 hours before</b> the
                scheduled event.
              </li>
              <li>
                Refund eligibility depends on the time of cancellation and the
                progress of service preparation.
              </li>
              <li>
                Failure to notify within the allowed timeframe will result in a
                <b> non-refundable</b> down payment.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-400 mb-2">
              4. Liability & Service Conditions
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                The company is not liable for delays caused by unforeseen
                circumstances (e.g., weather, power outage, or third-party issues).
              </li>
              <li>
                The client must ensure venue accessibility and readiness for
                service setup.
              </li>
              <li>
                Any damages to equipment during the event will be charged to the
                client.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-400 mb-2">
              5. Agreement
            </h2>
            <p>
              By proceeding with the booking, you acknowledge that you have read,
              understood, and agreed to the terms and conditions stated in this
              contract.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
