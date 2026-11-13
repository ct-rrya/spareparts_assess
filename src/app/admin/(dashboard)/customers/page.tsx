import React from 'react';
import { listDerivedCustomers } from '@/lib/db';
import { formatPHP } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const customers = await listDerivedCustomers();

  return (
    <>
      <div>
        <div className="text-xs sp-mono text-[#4A4F78] mb-1">RECORDS / DIRECTORY</div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E0B33] m-0">
          Customers
        </h1>
        <p className="text-sm text-[#4A4F78] mt-1 mb-0">
          Read-only customer summary derived from submitted orders.
        </p>
      </div>

      <div className="rounded-lg border border-[#D5DCF3] bg-white overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[680px] text-sm">
          <thead>
            <tr className="bg-[#F6F7FB] border-b border-[#D5DCF3] text-xs font-bold uppercase tracking-wider text-[#4A4F78] sp-mono text-left">
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Normalized Email</th>
              <th className="p-3.5">Contact</th>
              <th className="p-3.5">Orders</th>
              <th className="p-3.5">Last Order</th>
              <th className="p-3.5 text-right">Completed Spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-[#4A4F78]">
                  No customers yet. Customers appear here once orders are
                  submitted.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr
                  key={c.email}
                  className="border-b border-[#D5DCF3]/50 last:border-b-0 hover:bg-[#F6F7FB]/50 transition-colors"
                >
                  <td className="p-3.5 font-semibold text-[#0E0B33]">
                    {c.name}
                  </td>
                  <td className="p-3.5 sp-mono text-xs text-[#4A4F78]">{c.email}</td>
                  <td className="p-3.5 sp-mono text-xs text-[#4A4F78]">{c.contact_number}</td>
                  <td className="p-3.5 sp-mono font-medium text-[#0E0B33]">{c.order_count}</td>
                  <td className="p-3.5 text-xs sp-mono text-[#4A4F78]">
                    {new Date(c.last_order_date).toLocaleDateString('en-PH')}
                  </td>
                  <td className="p-3.5 font-bold sp-mono text-right text-[#1F06AC]">
                    {formatPHP(c.total_completed_spent)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
