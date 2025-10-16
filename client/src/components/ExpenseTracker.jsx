// client/src/components/ExpenseTracker.jsx
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  expensesAPI,
  personalDebtsAPI,
  reimbursementsAPI,
  recurringAPI,
} from "../utils/api";

const ExpenseTracker = ({ user, onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [recurringForm, setRecurringForm] = useState({
    amount: "",
    paidBy: "",
    description: "",
    paymentMethod: "",
    bankAccount: "",
    category: "",
    recurrence: "",
  });
  const [reimbursements, setReimbursements] = useState([]);
  const [personalDebts, setPersonalDebts] = useState([]);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paidBy: "",
    description: "",
    paymentMethod: "",
    bankAccount: "",
    category: "",
    isRecurring: false,
    recurrence: "mensuelle",
  });

  const categories = [
    "Loyer",
    "Charges",
    "Repas",
    "Courses",
    "Animal",
    "Abonnements",
    "Loisirs",
    "Santé",
    "Transport",
    "Autre",
  ];
  const paymentMethods = ["CB", "Prélèvement", "Espèces", "Virement"];
  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    // Récupère la liste figée depuis le localStorage (créée au clic sur Auth.jsx)
    const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(localUsers);
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear, view]);

  const loadAllData = async () => {
    setError("");
    try {
      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
      const endDate = new Date(
        selectedYear,
        selectedMonth + 1,
        0,
        23,
        59,
        59
      ).toISOString();

      const [expensesRes, debtsRes, reimbursementsRes, recurringRes] =
        await Promise.all([
          expensesAPI.getAll({ startDate, endDate }),
          personalDebtsAPI.getAll(),
          reimbursementsAPI.getAll(),
          recurringAPI.getAll(),
        ]);

      if (expensesRes.success) setExpenses(expensesRes.data);
      if (debtsRes.success) setPersonalDebts(debtsRes.data);
      if (reimbursementsRes.success) setReimbursements(reimbursementsRes.data);
      if (recurringRes.success) setRecurringExpenses(recurringRes.data);
    } catch (err) {
      setError("Erreur de chargement des données");
      console.error(err);
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.paidBy || !formData.description) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        addedBy: user,
      };

      const response = await expensesAPI.create(expenseData);

      if (response.success) {
        alert("Dépense ajoutée avec succès !");
        setFormData({
          amount: "",
          date: new Date().toISOString().split("T")[0],
          paidBy: "",
          description: "",
          paymentMethod: "",
          bankAccount: "",
          category: "",
          isRecurring: false,
          recurrence: "mensuelle",
        });
        await loadAllData();
      } else {
        alert(response.message || "Erreur lors de l'ajout");
      }
    } catch (err) {
      alert("Erreur de connexion au serveur");
      console.error(err);
    }
  };

  const handleSubmitPersonalDebt = async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const paidBy = e.target.paidBy.value;
    const owedBy = e.target.owedBy.value;
    const description = e.target.description.value;
    const date = e.target.date.value;

    if (!amount || !paidBy || !owedBy || !description) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    if (paidBy === owedBy) {
      alert("Le payeur et le débiteur doivent être différents");
      return;
    }

    try {
      const response = await personalDebtsAPI.create({
        amount,
        paidBy,
        owedBy,
        description,
        date,
        addedBy: user.id,
      });

      if (response.success) {
        alert("Avance personnelle enregistrée !");
        e.target.reset();
        await loadAllData();
      } else {
        alert(response.message || "Erreur lors de l'enregistrement");
      }
    } catch (err) {
      alert("Erreur de connexion au serveur");
      console.error(err);
    }
  };

  const handleReimbursement = async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const from = e.target.from.value;
    const to = e.target.to.value;
    const date = e.target.date.value;

    if (!amount || !from || !to) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    try {
      const response = await reimbursementsAPI.create({
        amount,
        from,
        to,
        date,
      });

      if (response.success) {
        alert("Remboursement enregistré !");
        e.target.reset();
        await loadAllData();
      } else {
        alert(response.message || "Erreur lors de l'enregistrement");
      }
    } catch (err) {
      alert("Erreur de connexion au serveur");
      console.error(err);
    }
  };

  const markDebtAsPaid = async (debtId) => {
    if (window.confirm("Marquer comme remboursée ?")) {
      try {
        const response = await personalDebtsAPI.markPaid(debtId);

        if (response.success) {
          alert("Dette remboursée !");
          await loadAllData();
        } else {
          alert(response.message || "Erreur");
        }
      } catch (err) {
        alert("Erreur de connexion au serveur");
        console.error(err);
      }
    }
  };

  const deleteExpense = async (id) => {
    if (window.confirm("Supprimer cette dépense ?")) {
      try {
        const response = await expensesAPI.delete(id);

        if (response.success) {
          await loadAllData();
        } else {
          alert(response.message || "Erreur lors de la suppression");
        }
      } catch (err) {
        alert("Erreur de connexion au serveur");
        console.error(err);
      }
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (
      !window.confirm(
        "Supprimer cette dépense récurrente ?\n\n⚠️ Les dépenses générées pour le mois en cours seront également supprimées."
      )
    )
      return;

    const res = await recurringAPI.delete(id);
    if (res.success) {
      alert(
        `Supprimée ! (${
          res.removedExpensesThisMonth || 0
        } dépense(s) retirée(s) ce mois)`
      );
      await loadAllData();
    } else {
      alert(res.message || "Erreur lors de la suppression");
    }
  };

  const openEditRecurring = (exp) => {
    setEditingRecurring(exp);
    setRecurringForm({
      amount: exp.amount ?? "",
      paidBy: exp.paidBy ?? "",
      description: exp.description ?? "",
      paymentMethod: exp.paymentMethod ?? "",
      bankAccount: exp.bankAccount ?? "",
      category: exp.category ?? "",
      recurrence: exp.recurrence ?? "mensuelle",
    });
  };

  const closeEditRecurring = () => {
    setEditingRecurring(null);
  };

  const handleRecurringFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRecurringForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitEditRecurring = async (e) => {
    e.preventDefault();
    if (!editingRecurring) return;

    const payload = {
      ...recurringForm,
      amount: parseFloat(recurringForm.amount),
      // startDate: string(yyyy-mm-dd) -> Date ISO côté API (Mongoose acceptera le cast)
    };

    const res = await recurringAPI.update(editingRecurring._id, payload);
    if (res.success) {
      alert(
        `Modifiée ! (${
          res.propagatedThisMonth || 0
        } occurrence(s) mise(s) à jour ce mois)`
      );
      closeEditRecurring();
      await loadAllData();
    } else {
      alert(res.message || "Erreur lors de la modification");
    }
  };

  const calculateBalance = () => {
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

    const monthlyExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    });

    const monthlyReimbursements = reimbursements.filter((reimb) => {
      const reimbDate = new Date(reimb.date);
      return reimbDate >= startDate && reimbDate <= endDate;
    });

    const monthlyUnpaidDebts = personalDebts.filter((debt) => {
      const debtDate = new Date(debt.date);
      return !debt.isPaid && debtDate >= startDate && debtDate <= endDate;
    });

    // Utilisateurs (ordre 0/1 pour cohérence UI)
    const user1Name = users[0] || "Utilisateur 1";
    const user2Name = users[1] || "Utilisateur 2";

    const person1Total = monthlyExpenses
      .filter((exp) => exp.paidBy === user1Name)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const person2Total = monthlyExpenses
      .filter((exp) => exp.paidBy === user2Name)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const reimbursementAdjustment = monthlyReimbursements.reduce(
      (sum, reimb) => {
        if (reimb.from === user1Name) return sum - reimb.amount;
        if (reimb.from === user2Name) return sum + reimb.amount;
        return sum;
      },
      0
    );

    const debtAdjustment = monthlyUnpaidDebts.reduce((sum, debt) => {
      if (debt.owedBy === user1Name) return sum - debt.amount;
      if (debt.owedBy === user2Name) return sum + debt.amount;
      return sum;
    }, 0);

    const totalExpenses = person1Total + person2Total;
    const halfExpenses = totalExpenses / 2;
    const difference =
      person1Total - halfExpenses + reimbursementAdjustment + debtAdjustment;

    // Qui doit à qui (en IDs)
    const owedBy = difference > 0 ? user2Name : user1Name;
    const owedTo = difference > 0 ? user1Name : user2Name;

    return {
      person1Total,
      person2Total,
      totalExpenses,
      owedAmount: Math.abs(difference),
      owedBy,
      owedTo,
      user1: user1Name,
      user2: user2Name,
    };
  };

  const calculatePersonalDebts = () => {
    const unpaidDebts = personalDebts.filter((debt) => !debt.isPaid);
    const user1Name = users[0];
    const user2Name = users[1];

    const person1Owes = unpaidDebts
      .filter((debt) => debt.owedBy === user1Name)
      .reduce((sum, debt) => sum + debt.amount, 0);

    const person2Owes = unpaidDebts
      .filter((debt) => debt.owedBy === user2Name)
      .reduce((sum, debt) => sum + debt.amount, 0);

    return { person1Owes, person2Owes };
  };

  const getExpensesByCategory = () => {
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

    const monthlyExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    });

    const categoryTotals = {};
    monthlyExpenses.forEach((exp) => {
      const cat = exp.category || "Autre";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const exportToExcel = () => {
    const csvContent = [
      [
        "Date",
        "Description",
        "Montant",
        "Payé par",
        "Ajouté par",
        "Catégorie",
      ].join(","),
      ...expenses.map((exp) =>
        [
          exp.date,
          exp.description,
          exp.amount,
          exp.paidBy,
          exp.addedBy || "N/A",
          exp.category || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download =
      "depenses_" + new Date().toISOString().split("T")[0] + ".csv";
    link.click();
  };

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    const currentDate = new Date();
    const isCurrentMonthCheck =
      selectedMonth === currentDate.getMonth() &&
      selectedYear === currentDate.getFullYear();

    if (isCurrentMonthCheck) {
      alert("Vous êtes déjà sur le mois en cours");
      return;
    }

    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return (
      selectedMonth === now.getMonth() && selectedYear === now.getFullYear()
    );
  };

  const balance = calculateBalance();
  const categoryData = getExpensesByCategory();
  const personalDebtsBalance = calculatePersonalDebts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              💰 Suivi des dépenses
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">👤 {user}</span>
              <button
                onClick={onLogout}
                className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={goToPreviousMonth}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition"
            >
              ← Précédent
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {monthNames[selectedMonth]} {selectedYear}
              </h2>
              {isCurrentMonth() ? (
                <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  📅 Mois en cours
                </span>
              ) : (
                <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  📚 Historique
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {!isCurrentMonth() && (
                <button
                  onClick={goToCurrentMonth}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  📅 Actuel
                </button>
              )}
              <button
                onClick={goToNextMonth}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition disabled:opacity-50"
                disabled={isCurrentMonth()}
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/** BANDEAU BOUTONS */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setView("dashboard")}
            className={
              "px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition " +
              (view === "dashboard"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50")
            }
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setView("add")}
            className={
              "px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition " +
              (view === "add"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50")
            }
          >
            ➕ Ajouter
          </button>
          <button
            onClick={() => setView("list")}
            className={
              "px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition " +
              (view === "list"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50")
            }
          >
            📋 Mes dépenses
          </button>
          <button
            onClick={() => setView("details")}
            className={
              "px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition " +
              (view === "details"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50")
            }
          >
            🔍 Partenaire
          </button>
          <button
            onClick={() => setView("recurring")}
            className={
              "px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition " +
              (view === "recurring"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50")
            }
          >
            🔄 Récurrentes
          </button>
          <button
            onClick={() => setView("personalDebt")}
            className={
              "px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition " +
              (view === "personalDebt"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50")
            }
          >
            💳 Avances
          </button>
          <button
            onClick={() => setView("reimburse")}
            className={
              "px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition " +
              (view === "reimburse"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50")
            }
          >
            💸 Rembourser
          </button>
        </div>

        {/** SECTION DASHBOARD */}
        {view === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-zinc-500 to-slate-600 rounded-2xl p-6 shadow-lg text-white">
              <h3 className="text-xl font-bold mb-4">
                📋 Dépenses - pot commun
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Total {balance.user1}
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {balance.person1Total.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Total {balance.user2}
                  </h3>
                  <p className="text-3xl font-bold text-indigo-600">
                    {balance.person2Total.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Total du mois
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {balance.totalExpenses.toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 shadow-lg text-white">
              <h3 className="text-xl font-bold mb-4">
                💰 Avances personnelles
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    {balance.user1} doit
                  </h3>
                  <p className="text-3xl font-bold text-amber-600">
                    {personalDebtsBalance.person1Owes.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    {balance.user2} doit
                  </h3>
                  <p className="text-3xl font-bold text-amber-600">
                    {personalDebtsBalance.person2Owes.toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg text-white">
              <h3 className="text-xl font-bold mb-4">
                💳 Balance finale du mois
              </h3>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  Pot commun + Avances personnelles non remboursées
                </h3>
                {balance.owedAmount > 0 ? (
                  <p className="text-2xl text-gray-600">
                    <span className="font-bold">
                      {balance.owedBy || "Utilisateur"}
                    </span>{" "}
                    doit{" "}
                    <span className="font-bold text-3xl text-green-600">
                      {balance.owedAmount.toFixed(2)} €
                    </span>{" "}
                    à{" "}
                    <span className="font-bold">
                      {balance.owedTo || "Utilisateur"}
                    </span>
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    Aucune dette ! 🎉
                  </p>
                )}
              </div>
            </div>

            {categoryData.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  📊 Par catégorie
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        name + ": " + value.toFixed(0) + "€"
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={"cell-" + index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/** SECTION AJOUTER */}
        {view === "add" && (
          <div className="bg-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              ➕ Ajouter une dépense
            </h2>
            <form onSubmit={handleSubmitExpense} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Montant (€) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payé par *
                </label>
                <select
                  name="paidBy"
                  value={formData.paidBy}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {users.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="Ex: Courses"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Méthode
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(formData.paymentMethod === "CB" ||
                formData.paymentMethod === "Prélèvement" ||
                formData.paymentMethod === "Virement") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banque / Compte (optionnel)
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="Ex: Compte joint, Banque Populaire, etc."
                  />
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                  id="isRecurring"
                />
                <label
                  htmlFor="isRecurring"
                  className="font-semibold text-gray-700 cursor-pointer"
                >
                  Dépense récurrente
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fréquence de récurrence
                  </label>
                  <select
                    name="recurrence"
                    value={formData.recurrence}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="hebdomadaire">Hebdomadaire</option>
                    <option value="mensuelle">Mensuelle</option>
                    <option value="trimestrielle">Trimestrielle</option>
                    <option value="annuelle">Annuelle</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
              >
                Ajouter la dépense
              </button>
            </form>
          </div>
        )}

        {/** SECTION MES DEPENSES */}
        {view === "list" && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                📋 Mes dépenses
              </h2>
              <button
                onClick={exportToExcel}
                className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition"
              >
                📥 CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Catégorie
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Montant
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses
                    .filter((exp) => {
                      const expDate = new Date(exp.date);
                      const startDate = new Date(
                        selectedYear,
                        selectedMonth,
                        1
                      );
                      const endDate = new Date(
                        selectedYear,
                        selectedMonth + 1,
                        0,
                        23,
                        59,
                        59
                      );
                      return (
                        exp.paidBy === user &&
                        expDate >= startDate &&
                        expDate <= endDate
                      );
                    })
                    .slice()
                    .reverse()
                    .map((exp) => (
                      <tr key={exp._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {new Date(exp.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {exp.description}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                            {exp.category || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold">
                          {exp.amount.toFixed(2)} €
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => deleteExpense(exp._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {expenses.filter((exp) => {
                const expDate = new Date(exp.date);
                const startDate = new Date(selectedYear, selectedMonth, 1);
                const endDate = new Date(
                  selectedYear,
                  selectedMonth + 1,
                  0,
                  23,
                  59,
                  59
                );
                return (
                  (exp.paidBy?.username === user.username ||
                    exp.paidBy === user.username) &&
                  expDate >= startDate &&
                  expDate <= endDate
                );
              }).length === 0 && (
                <p className="text-center text-gray-500 py-8">Aucune dépense</p>
              )}
            </div>
          </div>
        )}

        {/** SECTION PARTENAIRE */}
        {view === "details" && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              🔍 Dépenses du partenaire
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Catégorie
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses
                    .filter((exp) => {
                      const expDate = new Date(exp.date);
                      const startDate = new Date(
                        selectedYear,
                        selectedMonth,
                        1
                      );
                      const endDate = new Date(
                        selectedYear,
                        selectedMonth + 1,
                        0,
                        23,
                        59,
                        59
                      );
                      return (
                        exp.paidBy !== user &&
                        expDate >= startDate &&
                        expDate <= endDate
                      );
                    })
                    .slice()
                    .reverse()
                    .map((exp) => (
                      <tr key={exp._id} className="hover:bg-blue-50">
                        <td className="px-4 py-3 text-sm">
                          {new Date(exp.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {exp.description}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs">
                            {exp.category || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold">
                          {exp.amount.toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {expenses.filter((exp) => {
                const expDate = new Date(exp.date);
                const startDate = new Date(selectedYear, selectedMonth, 1);
                const endDate = new Date(
                  selectedYear,
                  selectedMonth + 1,
                  0,
                  23,
                  59,
                  59
                );
                return (
                  exp.paidBy !== user &&
                  expDate >= startDate &&
                  expDate <= endDate
                );
              }).length === 0 && (
                <p className="text-center text-gray-500 py-8">Aucune dépense</p>
              )}
            </div>
          </div>
        )}

        {/** SECTION DEPENSES RECURRENTE */}
        {view === "recurring" && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              🔄 Dépenses récurrentes
            </h2>
            <div className="space-y-4">
              {recurringExpenses.map((exp) => (
                <div
                  key={exp._id}
                  className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">
                        {exp.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        {exp.amount.toFixed(2)} € • {exp.paidBy} •{" "}
                        {exp.recurrence}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm font-semibold">
                      {exp.category}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditRecurring(exp)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteRecurring(exp._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {recurringExpenses.length === 0 && (
                <p className="text-center text-gray-500 py-8">Aucune</p>
              )}
            </div>
          </div>
        )}

        {/** SECTION MES AVANCES */}
        {view === "personalDebt" && (
          <div className="bg-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              💳 Avance personnelle{" "}
              <span className="text-base font-semibold italic">
                {" "}
                (hors pot commun)
              </span>
            </h2>

            <form
              onSubmit={handleSubmitPersonalDebt}
              className="space-y-4 mb-8"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Montant (€)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qui a avancé?
                  </label>
                  <select
                    name="paidBy"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {users.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qui doit?
                  </label>
                  <select
                    name="owedBy"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {users.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  placeholder="Ex: Réparation vélo"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
              >
                Enregistrer
              </button>
            </form>

            <h3 className="text-xl font-bold mb-4 text-gray-800">
              💰 En cours
            </h3>
            <div className="space-y-3">
              {personalDebts.filter((debt) => !debt.isPaid).length === 0 ? (
                <p className="text-center text-gray-500 py-4">Aucune avance</p>
              ) : (
                personalDebts
                  .filter((debt) => !debt.isPaid)
                  .slice()
                  .reverse()
                  .map((debt) => (
                    <div
                      key={debt._id}
                      className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">
                            {debt.description}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            📅 {new Date(debt.date).toLocaleDateString("fr-FR")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {debt.paidBy} → {debt.owedBy}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">
                            {debt.amount.toFixed(2)} €
                          </p>
                          <button
                            onClick={() => markDebtAsPaid(debt._id)}
                            className="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                          >
                            ✓ OK
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <h3 className="text-xl font-bold mb-4 mt-8 text-gray-800">
              ✅ Remboursées
            </h3>
            <div className="space-y-3">
              {personalDebts.filter((debt) => debt.isPaid).length === 0 ? (
                <p className="text-center text-gray-500 py-4">Aucune</p>
              ) : (
                personalDebts
                  .filter((debt) => debt.isPaid)
                  .slice()
                  .reverse()
                  .map((debt) => (
                    <div
                      key={debt._id}
                      className="p-4 bg-green-50 rounded-xl border-2 border-green-200 opacity-60"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-800 line-through">
                            {debt.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            {debt.paidBy} → {debt.owedBy}
                          </p>
                          <p className="text-xs text-gray-500">
                            Le{" "}
                            {new Date(debt.paidAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <p className="text-xl font-bold text-green-600">
                          {debt.amount.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/** SECTION REMBOURSEMENT */}
        {view === "reimburse" && (
          <div className="bg-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              💸 Remboursement
            </h2>
            <form onSubmit={handleReimbursement} className="space-y-4 mb-8">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    De
                  </label>
                  <select
                    name="from"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {users.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    À
                  </label>
                  <select
                    name="to"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {users.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Montant
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
              >
                Enregistrer
              </button>
            </form>

            <h3 className="text-xl font-bold mb-4 text-gray-800">Historique</h3>
            <div className="space-y-3">
              {reimbursements
                .filter((reimb) => {
                  const reimbDate = new Date(reimb.date);
                  const startDate = new Date(selectedYear, selectedMonth, 1);
                  const endDate = new Date(
                    selectedYear,
                    selectedMonth + 1,
                    0,
                    23,
                    59,
                    59
                  );
                  return reimbDate >= startDate && reimbDate <= endDate;
                })
                .slice()
                .reverse()
                .map((reimb) => (
                  <div
                    key={reimb._id}
                    className="p-4 bg-green-50 rounded-xl border-2 border-green-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {reimb.from} → {reimb.to}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(reimb.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-green-600">
                        {reimb.amount.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}
              {reimbursements.filter((reimb) => {
                const reimbDate = new Date(reimb.date);
                const startDate = new Date(selectedYear, selectedMonth, 1);
                const endDate = new Date(
                  selectedYear,
                  selectedMonth + 1,
                  0,
                  23,
                  59,
                  59
                );
                return reimbDate >= startDate && reimbDate <= endDate;
              }).length === 0 && (
                <p className="text-center text-gray-500 py-4">Aucun</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/** MODALE EDITION DEPENSES RECURRENTES */}
      {editingRecurring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                Modifier la dépense récurrente
              </h3>
              <button
                onClick={closeEditRecurring}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={submitEditRecurring}
              className="px-6 py-6 space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Montant (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={recurringForm.amount}
                    onChange={handleRecurringFormChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payé par
                  </label>
                  <select
                    name="paidBy"
                    value={recurringForm.paidBy}
                    onChange={handleRecurringFormChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {users.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={recurringForm.description}
                  onChange={handleRecurringFormChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Méthode
                  </label>
                  <select
                    name="paymentMethod"
                    value={recurringForm.paymentMethod}
                    onChange={handleRecurringFormChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {paymentMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banque / Compte
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={recurringForm.bankAccount}
                    onChange={handleRecurringFormChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="Ex: Compte joint"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    name="category"
                    value={recurringForm.category}
                    onChange={handleRecurringFormChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fréquence
                  </label>
                  <select
                    name="recurrence"
                    value={recurringForm.recurrence}
                    onChange={handleRecurringFormChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  >
                    <option value="hebdomadaire">Hebdomadaire</option>
                    <option value="mensuelle">Mensuelle</option>
                    <option value="trimestrielle">Trimestrielle</option>
                    <option value="annuelle">Annuelle</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditRecurring}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                >
                  Enregistrer
                </button>
              </div>

              <p className="text-xs text-gray-500 pt-2">
                ⚠️ Changer la fréquence modifie les prochaines générations. Les
                dépenses déjà créées ce mois-ci sont mises à jour pour les
                champs ci-dessus (montant, payeur, description, méthode, compte,
                catégorie), mais leur date ne bouge pas.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
