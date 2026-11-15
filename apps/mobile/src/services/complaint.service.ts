import { api } from './api';
export const complaintService = {
  create: (data: any) => api.post('/complaints', data).then(r => r.data),
  mine: (params?: any) => api.get('/complaints/mine', { params }).then(r => r.data),
  detail: (id: string) => api.get(`/complaints/${id}`).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/complaints/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/complaints/${id}`).then(r => r.data),
  list: (params?: any) => api.get('/complaints', { params }).then(r => r.data),
  geo: (params: any) => api.get('/complaints/geo', { params }).then(r => r.data),
  updateStatus: (id: string, data: { status: string; remarks?: string; resolutionImageUrls?: string[] }) => api.patch(`/complaints/${id}/status`, data).then(r => r.data),
  reopen: (id: string) => api.post(`/complaints/${id}/reopen`).then(r => r.data),
  addComment: (id: string, content: string) => api.post(`/complaints/${id}/comments`, { content }).then(r => r.data),
};
export const uploadService = {
  images: async (uris: { uri: string; name?: string; type?: string }[]) => {
    const form = new FormData();
    for (const f of uris) {
      if (f.uri.startsWith('data:') || f.uri.startsWith('blob:')) {
        const blob = await (await fetch(f.uri)).blob();
        form.append('files', blob, f.name ?? 'image.jpg');
      } else {
        // @ts-expect-error React Native FormData file
        form.append('files', { uri: f.uri, name: f.name ?? 'image.jpg', type: f.type ?? 'image/jpeg' });
      }
    }
    return api.post('/upload/images', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.urls as string[]);
  },
};
