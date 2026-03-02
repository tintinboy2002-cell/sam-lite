import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
// import apiService from 'views/admin/reporting/apiService';

const MAX_AUTHORITIES = 2;

export const useReportingAuthority = (user_id, isAdmin) => {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch authorities for a specific user
  const fetchUsersList = async () => {
    setLoading(true);
    try {
      const response = await httpInjectorService.getUsersReportingList();
      setAuthorities(response.data || []);
    } catch {
      toast.error('Failed to load reporting authorities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user_id) fetchUsersList();
  }, [user_id]);

  // Assign authority
  const assignAuthority = async (authorityUser) => {
    if (!isAdmin) return;

    if (!authorityUser?.id) {
      toast.error('Please select a valid reporting authority.');
      return;
    }

    if (authorityUser.id === user_id) {
      toast.error('User cannot assign themselves.');
      return;
    }

    if (authorities.length >= MAX_AUTHORITIES) {
      toast.error('Only two reporting authorities are allowed per user.');
      return;
    }

    const duplicate = authorities.some(a => a.id === authorityUser.id);
    if (duplicate) {
      toast.error('This reporting authority is already assigned.');
      return;
    }

    try {
      // assign/add authority api
      await httpInjectorService.assignAuthority(user_id, authorityUser.id);
      toast.success('Reporting authority assigned successfully');
      fetchUsersList();
    } catch {
      toast.error('Assignment failed');
    }
  };

  // Delete authority
  const deleteAuthority = async (authorityId) => {
    if (!isAdmin) return;

    try {
      // delete authority api
      await httpInjectorService.deleteAuthority(user_id, authorityId);
      toast.success('Reporting authority removed');
      fetchUsersList();
    } catch {
      toast.error('Delete failed');
    }
  };

  const updateAuthority = async (user_id,authorityId) => {
    if (!isAdmin) return;

    try {
      // delete authority api
      await httpInjectorService.updateAuthority(user_id, authorityId);
      toast.success('Reporting authority updated');
      fetchUsersList();
    } catch {
      toast.error('update failed');
    }
  };  

  return {
    authorities,
    loading,
    assignAuthority,
    deleteAuthority,
    updateAuthority,
    refresh: fetchUsersList,
  };
};