import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, User, Loader2 } from "lucide-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";

// Interface for Project P5
interface ProjectP5 {
  _id: string;
  title: string;
  theme: string;
  description: string;
  level: number;
  status?: string;
  startDate?: string;
}

const P5Dashboard = () => {
  const [projects, setProjects] = useState<ProjectP5[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch all projects for now (or filter by teacher's level)
        const res = await api.get("/p5");
        setProjects(res.data);
      } catch (error) {
        console.error("Gagal load project P5", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Projek Penguatan Profil Pelajar Pancasila (P5)
          </h2>
          <p className="text-muted-foreground">
            Kelola projek, tema, dan penilaian siswa.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Buat Projek Baru
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 && (
            <div className="col-span-3 text-center py-12 border border-dashed rounded-lg">
              <h3 className="text-lg font-medium text-muted-foreground">
                Belum ada projek aktif
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Silahkan buat projek baru untuk memulai.
              </p>
            </div>
          )}
          {projects.map((project) => (
            <Card
              key={project._id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/p5/${project._id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2">
                    {project.theme}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Aktif
                  </Badge>
                </div>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>Kelas {project.level}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="mr-1 h-3 w-3" />
                    <span>Tim Fasilitator</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default P5Dashboard;
