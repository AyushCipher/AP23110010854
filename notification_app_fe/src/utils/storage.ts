export const getReadNotifications = (): string[] => {
  const data = localStorage.getItem('read_notifications');
  return data ? JSON.parse(data) : [];
};

export const markAsRead = (id: string) => {
  const read = getReadNotifications();
  if (!read.includes(id)) {
    read.push(id);
    localStorage.setItem('read_notifications', JSON.stringify(read));
  }
};
