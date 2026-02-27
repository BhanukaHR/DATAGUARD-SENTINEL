import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../utils/constants";
import { DataTable } from "../components/common/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import type { DestinationTrustLevel } from "../types/risk-scoring-config";
import { toast } from "sonner";
import { Shield, Plus } from "lucide-react";

const columnHelper = createColumnHelper<DestinationTrustLevel & { id: string }>();

export function PolicyPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newCategory, setNewCategory] = useState("Unknown");
  const [newScore, setNewScore] = useState(50);

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, COLLECTIONS.SETTINGS));
      const settingsDoc = snap.docs.find((d) => d.id === "destinationTrust");
      if (!settingsDoc) return [];
      const data = settingsDoc.data();
      return (data.destinations || []).map((d: Record<string, unknown>, i: number) => ({ ...d, id: `dest-${i}` }));
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      // For simplicity, store destinations as an array in settings/destinationTrust
      const snap = await getDocs(collection(db, COLLECTIONS.SETTINGS));
      const settingsDoc = snap.docs.find((d) => d.id === "destinationTrust");
      const existing = settingsDoc?.data()?.destinations || [];
      const newDest = {
        domain: newDomain,
        category: newCategory,
        trustScore: newScore,
        addedAt: new Date(),
      };
      if (settingsDoc) {
        await updateDoc(doc(db, COLLECTIONS.SETTINGS, settingsDoc.id), {
          destinations: [...existing, newDest],
        });
      } else {
        await addDoc(collection(db, COLLECTIONS.SETTINGS), {
          destinations: [newDest],
        });
      }
    },
    onSuccess: () => {
      toast.success("Domain added");
      setNewDomain("");
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    },
    onError: () => toast.error("Failed to add domain"),
  });

  const columns = useMemo(() => [
    columnHelper.accessor("domain", {
      header: "Domain",
      cell: (info) => <span className="text-sm font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("category", {
      header: "Trust Category",
      cell: (info) => {
        const cat = info.getValue();
        const colors: Record<string, string> = {
          Trusted: "bg-green-100 text-green-700",
          Known: "bg-blue-100 text-blue-700",
          Unknown: "bg-slate-100 text-slate-700",
          Suspicious: "bg-orange-100 text-orange-700",
          Blacklisted: "bg-red-100 text-red-700",
        };
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[cat] || colors.Unknown}`}>{cat}</span>;
      },
    }),
    columnHelper.accessor("trustScore", {
      header: "Trust Score",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("addedAt", {
      header: "Added",
      cell: (info) => {
        const val = info.getValue();
        return <span className="text-xs text-slate-500">{val ? new Date(val as string).toLocaleDateString() : "—"}</span>;
      },
    }),
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-slate-700" />
          <h1 className="text-2xl font-semibold text-slate-900">Policy Management</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Domain
        </button>
      </div>

      {/* Add Domain Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-slate-900 mb-4">Add Destination Domain</h3>
          <div className="flex gap-3 flex-wrap items-end">
            <div>
              <label className="text-xs text-slate-500">Domain</label>
              <input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                className="mt-1 block w-60 px-3 py-1.5 text-sm border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="mt-1 block px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white"
              >
                <option value="Trusted">Trusted</option>
                <option value="Known">Known</option>
                <option value="Unknown">Unknown</option>
                <option value="Suspicious">Suspicious</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Trust Score (0-100)</label>
              <input
                type="number"
                value={newScore}
                onChange={(e) => setNewScore(Number(e.target.value))}
                min={0}
                max={100}
                className="mt-1 block w-20 px-3 py-1.5 text-sm border border-slate-200 rounded-md"
              />
            </div>
            <button
              onClick={() => newDomain && addMutation.mutate()}
              disabled={!newDomain || addMutation.isPending}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {addMutation.isPending ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* Destination Trust Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-slate-900 mb-4">Destination Trust List</h3>
        <DataTable columns={columns} data={destinations} isLoading={isLoading} />
      </div>
    </div>
  );
}
