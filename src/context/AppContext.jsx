import { createContext, useContext, useState } from 'react';

const today = new Date();
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const DEMO_CUSTOMERS = [
  {
    id: '1', name: 'Aaliyah Johnson', email: 'aaliyah@demo.com', goals: 'Weight Loss',
    visits: [
      { id: 'v1', item: 'Green Goddess', date: daysAgo(22) },
      { id: 'v2', item: 'Tropical Detox', date: daysAgo(18) },
    ],
    stamps: 2, rewardCount: 0,
  },
  {
    id: '2', name: 'Marcus Rivera', email: 'marcus@demo.com', goals: 'Recovery',
    visits: [
      { id: 'v3', item: 'Protein Power', date: daysAgo(17) },
      { id: 'v4', item: 'Protein Power', date: daysAgo(11) },
    ],
    stamps: 2, rewardCount: 0,
  },
  {
    id: '3', name: 'Sophie Chen', email: 'sophie@demo.com', goals: 'Energy',
    visits: [
      { id: 'v5', item: 'Citrus Surge', date: daysAgo(6) },
      { id: 'v6', item: 'Ginger Shot', date: daysAgo(3) },
      { id: 'v7', item: 'Citrus Surge', date: daysAgo(1) },
    ],
    stamps: 3, rewardCount: 0,
  },
  {
    id: '4', name: 'Devon Williams', email: 'devon@demo.com', goals: 'Immunity',
    visits: [
      { id: 'v8', item: 'Elderberry Boost', date: daysAgo(4) },
      { id: 'v9', item: 'Elderberry Boost', date: daysAgo(2) },
      { id: 'v10', item: 'Elderberry Boost', date: daysAgo(0) },
    ],
    stamps: 3, rewardCount: 0,
  },
  {
    id: '5', name: 'Priya Patel', email: 'priya@demo.com', goals: 'Gut Health',
    visits: [
      { id: 'v11', item: 'Prebiotic Glow', date: daysAgo(1) },
    ],
    stamps: 1, rewardCount: 0,
  },
  {
    id: '6', name: 'James O\'Brien', email: 'james@demo.com', goals: 'Weight Loss',
    visits: [
      { id: 'v12', item: 'Matcha Burn', date: daysAgo(25) },
      { id: 'v13', item: 'Matcha Burn', date: daysAgo(20) },
    ],
    stamps: 2, rewardCount: 0,
  },
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [customers, setCustomers] = useState(DEMO_CUSTOMERS);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [view, setView] = useState('customer'); // 'customer' | 'owner'

  const findOrCreateCustomer = (email, name, goals) => {
    const existing = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentCustomer(existing);
      return existing;
    }
    const newCustomer = {
      id: crypto.randomUUID(), name, email, goals,
      visits: [], stamps: 0, rewardCount: 0,
    };
    setCustomers(prev => [...prev, newCustomer]);
    setCurrentCustomer(newCustomer);
    return newCustomer;
  };

  const logVisit = (customerId, item) => {
    let rewardEarned = false;
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      const newStamps = (c.stamps + 1) % 5;
      const newRewardCount = c.stamps + 1 >= 5 ? c.rewardCount + 1 : c.rewardCount;
      if (c.stamps + 1 >= 5) rewardEarned = true;
      const updatedCustomer = {
        ...c,
        stamps: newStamps,
        rewardCount: newRewardCount,
        visits: [...c.visits, { id: crypto.randomUUID(), item, date: new Date().toISOString() }],
      };
      // Update currentCustomer reference too
      setCurrentCustomer(updatedCustomer);
      return updatedCustomer;
    }));
    return rewardEarned;
  };

  const getAtRiskCustomers = () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    return customers.filter(c => {
      if (c.visits.length === 0) return false;
      const last = new Date(c.visits[c.visits.length - 1].date);
      return last < cutoff;
    });
  };

  const getDaysSince = (customer) => {
    if (!customer.visits.length) return null;
    const last = new Date(customer.visits[customer.visits.length - 1].date);
    return Math.floor((new Date() - last) / (1000 * 60 * 60 * 24));
  };

  return (
    <AppContext.Provider value={{
      customers, currentCustomer, setCurrentCustomer, view, setView,
      findOrCreateCustomer, logVisit, getAtRiskCustomers, getDaysSince,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
