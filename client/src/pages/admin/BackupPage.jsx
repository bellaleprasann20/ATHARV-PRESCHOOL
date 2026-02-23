import { useState, useEffect } from 'react';
import { createBackup, getBackups, downloadBackup, deleteBackup, restoreBackup } from '../../api/backupApi';
import toast from 'react-hot-toast';
import { Database, Download, Trash2, RefreshCw, CloudUpload, CheckCircle, XCircle } from 'lucide-react';

const BackupPage = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBackups();
      setBackups(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { toast.error('Failed to load backups.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createBackup();
      toast.success('✅ Backup created successfully!');
      load();
    } catch { toast.error('Backup failed.'); }
    finally { setCreating(false); }
  };

  const handleDownload = async (backup) => {
    try {
      const res = await downloadBackup(backup._id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = backup.filename; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Download failed.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this backup? This cannot be undone.')) return;
    try {
      await deleteBackup(id);
      toast.success('Backup deleted.');
      load();
    } catch { toast.error('Delete failed.'); }
  };

  const handleRestore = async (id) => {
    if (!confirm('⚠️ RESTORE will OVERWRITE all current data! Are you absolutely sure?')) return;
    setRestoring(id);
    try {
      await restoreBackup(id);
      toast.success('Database restored successfully!');
    } catch { toast.error('Restore failed.'); }
    finally { setRestoring(null); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Backup & Restore</h1>
          <p className="text-sm text-gray-500 mt-1">Auto backup runs daily at 2:00 AM IST</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          <CloudUpload size={16} />
          {creating ? 'Creating...' : 'Create Backup Now'}
        </button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Database, label: 'Total Backups', value: backups.length, color: 'bg-indigo-50 text-indigo-600' },
          { icon: CheckCircle, label: 'Successful', value: backups.filter(b => b.status === 'success').length, color: 'bg-green-50 text-green-600' },
          { icon: RefreshCw, label: 'Auto Backups', value: backups.filter(b => b.type === 'auto').length, color: 'bg-orange-50 text-orange-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Backup list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Backup History</h2>
          <button onClick={load} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading...</div>
        ) : backups.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Database size={40} className="mx-auto mb-3 opacity-30" />
            <p>No backups yet. Create your first backup!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {backups.map(backup => (
              <div key={backup._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                    backup.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {backup.status === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{backup.filename}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        backup.type === 'auto' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {backup.type}
                      </span>
                      <span className="text-xs text-gray-400">{formatSize(backup.fileSize)}</span>
                      <span className="text-xs text-gray-400">
                        {backup.recordCounts ? `${backup.recordCounts.students} students, ${backup.recordCounts.payments} payments` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-400">
                    {new Date(backup.createdAt).toLocaleString('en-IN')}
                  </p>
                  <button
                    onClick={() => handleDownload(backup)}
                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleRestore(backup._id)}
                    disabled={restoring === backup._id}
                    className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                    title="Restore (OVERWRITES data!)"
                  >
                    <RefreshCw size={16} className={restoring === backup._id ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={() => handleDelete(backup._id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        ⚠️ <strong>Important:</strong> The "Restore" function will overwrite all current data with the backup. Always create a new backup before restoring. Store backups in a safe external location (Google Drive, USB).
      </div>
    </div>
  );
};

export default BackupPage;