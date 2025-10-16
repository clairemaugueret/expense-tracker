// client/src/utils/api.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// On lit le user depuis le localStorage
const getJsonHeaders = () => {
  const username = localStorage.getItem("currentUser") || "";
  return {
    "Content-Type": "application/json",
    "x-username": username,
  };
};

// API Expenses
export const expensesAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/expenses?${queryParams}`, {
      headers: getJsonHeaders(),
    });
    return response.json();
  },

  create: async (expenseData) => {
    const response = await fetch(`${API_URL}/expenses`, {
      method: "POST",
      headers: getJsonHeaders(),
      body: JSON.stringify(expenseData),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: "DELETE",
      headers: getJsonHeaders(),
    });
    return response.json();
  },
};

// API Personal Debts
export const personalDebtsAPI = {
  getAll: async (isPaid) => {
    const query = isPaid !== undefined ? `?isPaid=${isPaid}` : "";
    const response = await fetch(`${API_URL}/personal-debts${query}`, {
      headers: getJsonHeaders(),
    });
    return response.json();
  },

  create: async (debtData) => {
    const response = await fetch(`${API_URL}/personal-debts`, {
      method: "POST",
      headers: getJsonHeaders(),
      body: JSON.stringify(debtData),
    });
    return response.json();
  },

  markPaid: async (id) => {
    const response = await fetch(`${API_URL}/personal-debts/${id}/mark-paid`, {
      method: "PUT",
      headers: getJsonHeaders(),
    });
    return response.json();
  },
};

// API Reimbursements
export const reimbursementsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/reimbursements`, {
      headers: getJsonHeaders(),
    });
    return response.json();
  },

  create: async (reimbursementData) => {
    const response = await fetch(`${API_URL}/reimbursements`, {
      method: "POST",
      headers: getJsonHeaders(),
      body: JSON.stringify(reimbursementData),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/reimbursements/${id}`, {
      method: "DELETE",
      headers: getJsonHeaders(),
    });
    return response.json();
  },
};

// API Recurring Expenses
export const recurringAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/recurring`, {
      headers: getJsonHeaders(),
    });
    return response.json();
  },

  deactivate: async (id) => {
    const response = await fetch(`${API_URL}/recurring/${id}/deactivate`, {
      method: "PUT",
      headers: getJsonHeaders(),
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/recurring/${id}`, {
      method: "PUT",
      headers: getJsonHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/recurring/${id}`, {
      method: "DELETE",
      headers: getJsonHeaders(),
    });
    return response.json();
  },
};
