import { useAudit } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Bell, Calendar, AlertCircle, UserPlus, CheckCircle, ArrowUpCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export function Notifications() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    completeNotificationAction,
    deleteNotification,
    escalateNotification,
  } = useAudit();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Deadline':
        return Calendar;
      case 'Status Change':
        return AlertCircle;
      case 'Assignment':
        return UserPlus;
      case 'Alert':
        return Bell;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'Deadline':
        return { bg: 'var(--council-orange-light)', color: 'var(--council-orange)' };
      case 'Status Change':
        return { bg: 'var(--council-blue-light)', color: 'var(--council-blue)' };
      case 'Assignment':
        return { bg: 'var(--council-purple-light)', color: 'var(--council-purple)' };
      case 'Alert':
        return { bg: '#FEF2F2', color: '#DC2626' };
      default:
        return { bg: 'var(--council-blue-light)', color: 'var(--council-blue)' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllNotificationsAsRead}
            variant="outline"
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {userNotifications.length > 0 ? (
          userNotifications.map(notification => {
            const Icon = getNotificationIcon(notification.type);
            const colors = getNotificationColor(notification.type);

            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all ${
                  !notification.read ? 'border-l-4 shadow-md' : 'opacity-75'
                }`}
                style={{
                  borderLeftColor: !notification.read ? colors.color : undefined,
                  backgroundColor: !notification.read ? colors.bg : undefined,
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: colors.bg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: colors.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                            {!notification.read && (
                              <Badge
                                className="text-white"
                                style={{ backgroundColor: colors.color }}
                              >
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          {notification.projectName && (
                            <p className="text-sm text-gray-500 mt-1">
                              Project: {notification.projectName}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                completeNotificationAction(notification.id);
                              }}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Action Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 bg-white text-orange-700 border-orange-200 hover:bg-orange-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                escalateNotification(notification.id);
                              }}
                            >
                              <ArrowUpCircle className="w-4 h-4" />
                              Escalate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 bg-white text-red-700 border-red-200 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
