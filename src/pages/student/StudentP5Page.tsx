import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, NavArrowRight } from "iconoir-react";
import api from "@/services/api";

const StudentP5Page = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine level from User Class Name (e.g. "7A" -> "7")
    const cls = user?.profile?.class || "";
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
          Satya Cendekia Project Hub
        </h2>
        <p className="text-slate-500">
          Etalase Karya dan Jurnal Refleksi Siswa.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-3 text-center text-slate-400">
            Memuat projek...
          </p>
        ) : projects.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-slate-50 rounded text-slate-500">
            Belum ada projek untuk level Anda saat ini.
          </div>
        ) : (
          projects.map((p) => (
            <Card
              key={p._id}
              className="group hover:shadow-xl transition-all border-t-4 border-t-school-gold cursor-pointer hover:-translate-y-1 relative overflow-hidden"
              onClick={() => navigate(`/dashboard/student/p5/${p._id}`)}
            >
              {/* Hover visual cue */}
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <NavArrowRight className="w-5 h-5 text-school-navy" />
              </div>

              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-600 group-hover:bg-school-gold group-hover:text-school-navy transition-colors"
                  >
                    {p.theme}
                  </Badge>
                  <Badge
                    className={
                      p.status === "active" ? "bg-green-600" : "bg-slate-400"
                    }
                  >
                    {p.status === "active" ? "Aktif" : "Selesai"}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-school-navy leading-tight">
                  {p.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
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
                    <p className="font-semibold mb-1 text-xs uppercase tracking-wide text-slate-400">
                      Dimensi Fokus
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {/* Fix: use Array.from(new Set(...)) to get unique dimensions */}
                      {Array.from(
                        new Set(p.targets?.map((t: any) => t.dimension)),
                      )
                        .slice(0, 3)
                        .map((d: any) => (
                          <Badge
                            key={d}
                            variant="outline"
                            className="text-[10px] px-1 py-0"
                          >
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
