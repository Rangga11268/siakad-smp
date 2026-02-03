import { useState, useEffect } from "react";
import { Bell, Check, MoreHoriz } from "iconoir-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/services/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications?limit=10");
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/all/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment_new":
        return "📝";
      case "deadline_reminder":
        return "⏰";
      case "grade_published":
        return "🎯";
      case "submission_received":
        return "📬";
      case "announcement":
        return "📢";
      default:
        return "🔔";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-slate-100"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
          <h3 className="font-bold text-slate-800">Notifikasi</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-school-primary hover:text-school-primary/80"
              onClick={markAllAsRead}
            >
              <Check className="w-3 h-3 mr-1" />
              Tandai Semua Dibaca
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-200" />
              <p className="text-sm">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={cn(
                    "px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors",
                    !n.read && "bg-blue-50/50",
                  )}
                  onClick={() => {
                    if (!n.read) markAsRead(n._id);
                    if (n.link) {
                      window.location.href = n.link;
                    }
                    setIsOpen(false);
                  }}
                >
                  <div className="flex gap-3">
                    <span className="text-xl">{getIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium text-slate-800 truncate",
                          !n.read && "font-semibold",
                        )}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t bg-slate-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-slate-600"
              onClick={() => {
                window.location.href = "/notifications";
                setIsOpen(false);
              }}
            >
              <MoreHoriz className="w-4 h-4 mr-1" />
              Lihat Semua Notifikasi
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
