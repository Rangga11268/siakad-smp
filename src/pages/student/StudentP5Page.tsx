import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "iconoir-react";
import api from "@/services/api";

const StudentP5Page = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine level from User Class Name (e.g. "7A" -> "7")
    const cls = user?.profile?.class || "";
    // Simple logic: first char usually level or fetch class data properly.
    // For now simple regex or assuming data integrity.
    // Better: Fetch class data to get level. But let's try fetch logic with just level if possible.
    // Or just fetch all and backend might filter? No backend getProjects filters by Query.
    // Let's fetch Class first (like AssignmentPage).
    if (cls) loadData();
    else setLoading(false);
  }, [user]);

  const loadData = async () => {
    try {
      // 1. Get Class info
      const classRes = await api.get("/academic/class");
      const myClass = classRes.data.find(
        (c: any) => c.name === user?.profile?.class,
      );

      if (myClass) {
        // 2. Get active academic year?
        // Actually getProjects supports level.
        const res = await api.get(`/p5?level=${myClass.level}`);
        setProjects(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-school-navy">
          Projek P5
        </h2>
        <p className="text-slate-500">
          Projek Penguatan Profil Pelajar Pancasila.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-3 text-center text-slate-400">
            Memuat projek...
          </p>
        ) : projects.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-slate-50 rounded text-slate-500">
            Belum ada projek untuk level ini.
          </div>
        ) : (
          projects.map((p) => (
            <Card
              key={p._id}
              className="hover:shadow-md transition-shadow border-t-4 border-t-school-gold"
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">{p.theme}</Badge>
                  <Badge
                    className={
                      p.status === "active" ? "bg-green-600" : "bg-slate-400"
                    }
                  >
                    {p.status === "active" ? "Aktif" : "Selesai"}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-school-navy">
                  {p.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {p.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-school-gold" />
                    <span>
                      Fasilitator:{" "}
                      {p.facilitators
                        ?.map((f: any) => f.profile?.fullName)
                        .join(", ")}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <p className="font-semibold mb-1">Dimensi:</p>
                    <div className="flex flex-wrap gap-1">
                      {p.dimensions?.map((d: string) => (
                        <Badge key={d} variant="outline" className="text-xs">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentP5Page;
