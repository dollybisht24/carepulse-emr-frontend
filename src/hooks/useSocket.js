import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import socket from '../services/socket';

export const useSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleAppointmentCreated = (data) => {
      // Invalidate appointment list, dashboard stats, and slots cache
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    };

    const handleAppointmentCancelled = (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    };

    const handleAppointmentUpdated = (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    };

    const handleStatusChanged = (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    };

    socket.on('appointment:created', handleAppointmentCreated);
    socket.on('appointment:cancelled', handleAppointmentCancelled);
    socket.on('appointment:updated', handleAppointmentUpdated);
    socket.on('appointment:status_changed', handleStatusChanged);

    return () => {
      socket.off('appointment:created', handleAppointmentCreated);
      socket.off('appointment:cancelled', handleAppointmentCancelled);
      socket.off('appointment:updated', handleAppointmentUpdated);
      socket.off('appointment:status_changed', handleStatusChanged);
    };
  }, [queryClient]);
};
