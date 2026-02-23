import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudent } from '../../api/studentApi';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, User } from 'lucide-react';

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-colors ${className}`}
    {...props}
  />
);

const Select = ({ children, ...props }) => (
  <select
    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-colors bg-white"
    {...props}
  >
    {children}
  </select>
);

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-indigo-100">
    <span className="text-xl">{icon}</span>
    <h3 className="font-black text-gray-700 text-sm uppercase tracking-wide">{title}</h3>
  </div>
);

const AddStudentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '',
    class: '', section: 'A', academicYear: '2024-2025',
    bloodGroup: '', fatherName: '', motherName: '',
    guardianPhone: '', guardianEmail: '',
    address: { street: '', city: 'Pune', state: 'Maharashtra', pincode: '' },
    emergencyContact: { name: '', phone: '', relation: '' },
    medicalNotes: '', allergies: '',
  });
  const [photo, setPhoto] = useState(null);

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));
  const setAddr = (field, value) => setForm(p => ({ ...p, address: { ...p.address, [field]: value } }));
  const setEmergency = (field, value) => setForm(p => ({ ...p, emergencyContact: { ...p.emergencyContact, [field]: value } }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.gender || !form.class || !form.guardianPhone) {
      return toast.error('Please fill all required fields.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (typeof val === 'object' && !Array.isArray(val)) {
          Object.entries(val).forEach(([k, v]) => formData.append(`${key}[${k}]`, v));
        } else {
          formData.append(key, val);
        }
      });
      if (photo) formData.append('photo', photo);

      await createStudent(formData);
      toast.success('✅ Student added successfully!');
      navigate('/admin/students');
    } catch (err) {
      toast.error(err.message || 'Failed to add student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add New Student</h1>
          <p className="text-sm text-gray-400">Admission No. will be auto-generated</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo + Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <SectionHeader icon="👦" title="Basic Information" />
          <div className="flex gap-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-dashed border-indigo-300 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                onClick={() => document.getElementById('photo-input').click()}>
                {photoPreview
                  ? <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                  : <User size={32} className="text-indigo-300" />}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
              <input id="photo-input" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <p className="text-xs text-gray-400 text-center">Click to upload<br />photo (optional)</p>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
              <Field label="First Name" required>
                <Input placeholder="e.g. Aarav" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
              </Field>
              <Field label="Last Name" required>
                <Input placeholder="e.g. Sharma" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
              </Field>
              <Field label="Date of Birth" required>
                <Input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} required />
              </Field>
              <Field label="Gender" required>
                <Select value={form.gender} onChange={e => set('gender', e.target.value)} required>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
              <Field label="Blood Group">
                <Select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b}>{b}</option>)}
                </Select>
              </Field>
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <SectionHeader icon="🎓" title="Academic Details" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Class" required>
              <Select value={form.class} onChange={e => set('class', e.target.value)} required>
                <option value="">Select class</option>
                {['Nursery', 'LKG', 'UKG', 'Daycare'].map(c => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Section">
              <Select value={form.section} onChange={e => set('section', e.target.value)}>
                {['A', 'B', 'C'].map(s => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Academic Year">
              <Select value={form.academicYear} onChange={e => set('academicYear', e.target.value)}>
                {['2023-2024', '2024-2025', '2025-2026'].map(y => <option key={y}>{y}</option>)}
              </Select>
            </Field>
            <Field label="Admission Date">
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </Field>
          </div>
        </div>

        {/* Parent Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <SectionHeader icon="👨‍👩‍👦" title="Parent / Guardian Info" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Father's Name">
              <Input placeholder="Father's full name" value={form.fatherName} onChange={e => set('fatherName', e.target.value)} />
            </Field>
            <Field label="Mother's Name">
              <Input placeholder="Mother's full name" value={form.motherName} onChange={e => set('motherName', e.target.value)} />
            </Field>
            <Field label="Guardian Phone" required>
              <Input type="tel" placeholder="+91 98765 43210" value={form.guardianPhone} onChange={e => set('guardianPhone', e.target.value)} required />
            </Field>
            <Field label="Guardian Email">
              <Input type="email" placeholder="parent@example.com" value={form.guardianEmail} onChange={e => set('guardianEmail', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <SectionHeader icon="🏠" title="Address" />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Street Address">
                <Input placeholder="House no, Street, Area" value={form.address.street} onChange={e => setAddr('street', e.target.value)} />
              </Field>
            </div>
            <Field label="City">
              <Input placeholder="City" value={form.address.city} onChange={e => setAddr('city', e.target.value)} />
            </Field>
            <Field label="State">
              <Input placeholder="State" value={form.address.state} onChange={e => setAddr('state', e.target.value)} />
            </Field>
            <Field label="Pincode">
              <Input placeholder="411001" value={form.address.pincode} onChange={e => setAddr('pincode', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Medical + Emergency */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <SectionHeader icon="🏥" title="Medical & Emergency" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Allergies (comma separated)">
              <Input placeholder="e.g. peanuts, dust" value={form.allergies} onChange={e => set('allergies', e.target.value)} />
            </Field>
            <Field label="Medical Notes">
              <Input placeholder="Any medical conditions..." value={form.medicalNotes} onChange={e => set('medicalNotes', e.target.value)} />
            </Field>
            <Field label="Emergency Contact Name">
              <Input placeholder="Name" value={form.emergencyContact.name} onChange={e => setEmergency('name', e.target.value)} />
            </Field>
            <Field label="Emergency Contact Phone">
              <Input type="tel" placeholder="Phone" value={form.emergencyContact.phone} onChange={e => setEmergency('phone', e.target.value)} />
            </Field>
            <Field label="Relation">
              <Select value={form.emergencyContact.relation} onChange={e => setEmergency('relation', e.target.value)}>
                <option value="">Select</option>
                {['Uncle', 'Aunt', 'Grandparent', 'Sibling', 'Neighbour', 'Other'].map(r => <option key={r}>{r}</option>)}
              </Select>
            </Field>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-60 shadow-lg shadow-indigo-200">
            {loading ? 'Saving...' : '✅ Add Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentPage;