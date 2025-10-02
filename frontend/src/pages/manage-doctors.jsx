import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ManageDoctors() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const API = "http://localhost:4000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "doctor") router.replace("/");
    else fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API}/doctors`);
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email,
          password,
          specialty,
          role: "doctor"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setName("");
        setEmail("");
        setPassword("");
        setSpecialty("");
        fetchDoctors();
      } else {
        alert(data.error || "Erreur");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDoctor = async (id) => {
    if (!confirm("Supprimer ce doctor?")) return;
    try {
      await fetch(`${API}/doctors/${id}`, { method: "DELETE" });
      fetchDoctors();
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    router.push("/");
  };

  const doctor = () => {
    router.push("/doctor");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-5 font-sans">
      <h1 className="text-2xl font-bold mb-4">Gestion des Doctors</h1>

      {/* Boutons navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={doctor}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          HOME 
        </button>
        <button
          onClick={logout}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Formulaire ajout doctor */}
      <form
        onSubmit={addDoctor}
        className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mb-6"
      >
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border w-full p-2 rounded mb-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-2 rounded mb-2"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full p-2 rounded mb-2"
        />
        <input
          type="text"
          placeholder="Specialty"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="border w-full p-2 rounded mb-2"
        />
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full">
          Ajouter Doctor
        </button>
      </form>

      {/* Liste des doctors */}
      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="flex justify-between items-center border-b py-2"
          >
            <span>
              {doc.username} ({doc.email}) — {doc.specialty}
            </span>
            <button
              onClick={() => deleteDoctor(doc.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
