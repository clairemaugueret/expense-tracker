// client/src/utils/api.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getToken = () => {
  return localStorage.getItem("token");
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// API Auth
export const authAPI = {
  getUsers: async () => {
    const response = await fetch(`${API_URL}/auth/users`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// API Expenses
export const expensesAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/expenses?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (expenseData) => {
    const response = await fetch(`${API_URL}/expenses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(expenseData),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getBalance: async (month, year) => {
    const response = await fetch(
      `${API_URL}/expenses/balance/monthly?month=${month}&year=${year}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.json();
  },
};

// API Personal Debts
export const personalDebtsAPI = {
  getAll: async (isPaid) => {
    const query = isPaid !== undefined ? `?isPaid=${isPaid}` : "";
    const response = await fetch(`${API_URL}/personal-debts${query}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (debtData) => {
    const response = await fetch(`${API_URL}/personal-debts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(debtData),
    });
    return response.json();
  },

  markPaid: async (id) => {
    const response = await fetch(`${API_URL}/personal-debts/${id}/mark-paid`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// API Reimbursements
export const reimbursementsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/reimbursements`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  create: async (reimbursementData) => {
    const response = await fetch(`${API_URL}/reimbursements`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(reimbursementData),
    });
    return response.json();
  },
};

// API Recurring Expenses
export const recurringAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/recurring`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  deactivate: async (id) => {
    const response = await fetch(`${API_URL}/recurring/${id}/deactivate`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
