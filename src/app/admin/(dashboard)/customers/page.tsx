import React from 'react';
import { listDerivedCustomers } from '@/lib/db';
import { formatPHP } from '@/lib/money';

export const dynamic = 'force-dynamic';

function formatShortDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  const day = String(d.getDate()).padStart(2, '0');
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function AdminCustomersPage() {
  const customers = await listDerivedCustomers();

  return (
    <>
      <div>
        <h1 className="font-catchye m-0 text-[36px] leading-none tracking-[-0.01em] text-[#121212]">
          Customers
        </h1>
        <p className="sp-mono mt-2 mb-0 text-[11px] uppercase tracking-[0.08em] text-[#7D8292]">
          {customers.length} TOTAL · READ-ONLY
        </p>
        <p className="mt-2 mb-0 text-sm text-[#5C6072]">
          Customer records are created automatically from submitted orders.
        </p>
      </div>

      {/* mobile customer cards */}
      <div className="md:hidden flex flex-col gap-2.5">
        {customers.length === 0 ? (
          <div className="rounded-[8px] border border-[#E2E4EC] bg-white p-8 text-center text-sm text-[#7D8292]">
            No customers yet. Customers appear here once orders are submitted.
          </div>
        ) : (
          customers.map((c) => (
            <div
              key={c.email}
              className="rounded-[8px] border border-[#E2E4EC] bg-white p-4 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-semibold text-[#121212] truncate">
                  {c.name}
                </span>
                <span className="sp-mono shrink-0 rounded-[4px] bg-[#E8EDFF] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.05em] text-[#1C47CC]">
                  {c.order_count} {c.order_count === 1 ? 'ORDER' : 'ORDERS'}
                </span>
              </div>
              <div className="sp-mono text-xs text-[#5C6072] truncate">
                {c.email}
              </div>
              <div className="sp-mono text-xs text-[#7D8292]">
                {c.contact_number}
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 mt-0.5 border-t border-[#ECEEF4]">
                <span className="sp-mono text-[11px] text-[#7D8292]">
                  LAST {formatShortDate(c.last_order_date)}
                </span>
                <span className="text-sm font-bold text-[#1F06AC]">
                  {formatPHP(c.total_completed_spent)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* desktop customers table */}
      <div className="hidden md:block overflow-hidden rounded-[8px] border border-[#E2E4EC] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="sp-mono border-b border-[#ECEEF4] bg-[#F7F8FC] text-[10px] uppercase tracking-[0.08em] text-[#7D8292]">
                <th className="px-5 py-3 font-medium">CUSTOMER</th>
                <th className="px-5 py-3 font-medium">EMAIL</th>
                <th className="px-5 py-3 font-medium">CONTACT</th>
                <th className="px-5 py-3 font-medium">ORDERS</th>
                <th className="px-5 py-3 font-medium">LAST ORDER</th>
                <th className="px-5 py-3 text-right font-medium">
                  COMPLETED SPENT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEEF4]">
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-[#7D8292]"
                  >
                    No customers yet. Customers appear here once orders are
                    submitted.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.email}
                    className="transition-colors hover:bg-[#F9FAFC]"
                  >
                    <td className="px-5 py-3.5 text-[13.5px] font-semibold text-[#121212]">
                      {c.name}
                    </td>
                    <td className="sp-mono px-5 py-3.5 text-[12px] text-[#5C6072]">
                      {c.email}
                    </td>
                    <td className="sp-mono px-5 py-3.5 text-[12px] text-[#5C6072]">
                      {c.contact_number}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#5C6072]">
                      {c.order_count}
                    </td>
                    <td className="sp-mono px-5 py-3.5 text-[11px] text-[#5C6072]">
                      {formatShortDate(c.last_order_date)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-[13.5px] font-medium text-[#121212]">
                      {formatPHP(c.total_completed_spent)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
