"use client"
import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Info, X } from "lucide-react"
import axios from "axios"
import Image from "next/image"
import useNotificationStore from '@/app/hooks/useNotifications'
import { pusherClient } from "@/app/libs/pusher"
import { useSession } from "next-auth/react"

interface Host {
  name: string;
  image: string;
}

interface Notification {
  id: string;
  message: string;
  type: string;
  createdAt: Date;
  isRead: boolean;
  host?: Host;
  userId: string;
}

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { decrementCount, incrementCount } = useNotificationStore();
  const { data: session } = useSession();
  const userId = session?.user?.email ? session.user.email : null;
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every minute as a fallback
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Pusher subscription for real-time notifications
  useEffect(() => {
    if (!userId) return;
    
    // Subscribe to user's personal notification channel
    const channel = `user-${userId}-notifications`;
    pusherClient.subscribe(channel);
    
    // Handle new notification
    const newNotificationHandler = (notification: Notification) => {
      setNotifications((current) => [notification, ...current]);
      incrementCount();
    };
    
    // Handle notification removal
    const removedNotificationHandler = (notificationId: string) => {
      setNotifications((current) => 
        current.filter(notification => notification.id !== notificationId)
      );
    };
    
    // Bind the events
    pusherClient.bind('notification:new', newNotificationHandler);
    pusherClient.bind('notification:remove', removedNotificationHandler);
    
    return () => {
      pusherClient.unsubscribe(channel);
      pusherClient.unbind('notification:new', newNotificationHandler);
      pusherClient.unbind('notification:remove', removedNotificationHandler);
    };
  }, [userId, incrementCount]);

  const removeNotification = async (id: string) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter((notification) => notification.id !== id));
      decrementCount(); // Decrement the notification count
    } catch (error) {
      console.error('Failed to remove notification:', error);
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />
      case "info":
        return <Info className="h-6 w-6 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200 ${
                    notification.type === "success"
                      ? "bg-green-50"
                      : notification.type === "error"
                        ? "bg-red-50"
                        : "bg-blue-50"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {getIcon(notification.type)}
                    <div className="flex items-center space-x-3">
                      {notification.host && (
                        <div className="flex-shrink-0">
                          <Image
                            src={notification.host.image || "/images/placeholder.jpg"}
                            alt={notification.host.name || "Host"}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        {notification.host && (
                          <span className="text-xs font-medium text-gray-500">
                            {notification.host.name}
                          </span>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {notification.message}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full p-1 transition-colors duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPage