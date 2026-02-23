import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, User, Phone, Home, GraduationCap } from 'lucide-react';

const studentSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  dateOfBirth: z.string().min(1, "DOB is required"),
  gender: z.enum(['Male', 'Female', 'Other']),
  enrollmentClass: z.enum(['Playgroup', 'Nursery', 'LKG', 'UKG']),
  parentName: z.string().min(2, "Parent name is required"),
  parentPhone: z.string().regex(/^[0-9]{10}$/, "Invalid 10-digit phone number"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required"),
});

const StudentForm = ({ initialData, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || { gender: 'Male', enrollmentClass: 'Nursery' }
  });

  const inputStyle = "w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition border-slate-300";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Student Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <User size={18} className="text-blue-600" /> Student Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
              <input {...register('firstName')} className={inputStyle} />
              {errors.firstName && <p className="text-red-500 text-[10px]">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
              <input {...register('lastName')} className={inputStyle} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
              <input type="date" {...register('dateOfBirth')} className={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
              <select {...register('gender')} className={inputStyle}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Admission Class</label>
            <select {...register('enrollmentClass')} className={inputStyle}>
              <option value="Playgroup">Playgroup</option>
              <option value="Nursery">Nursery</option>
              <option value="LKG">LKG</option>
              <option value="UKG">UKG</option>
            </select>
          </div>
        </div>

        {/* Parent & Contact Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <Phone size={18} className="text-green-600" /> Guardian Details
          </h3>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Parent/Guardian Name</label>
            <input {...register('parentName')} className={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
              <input {...register('parentPhone')} className={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input {...register('email')} className={inputStyle} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Residential Address</label>
            <textarea {...register('address')} rows="3" className={inputStyle}></textarea>
          </div>
        </div>
      </div>

      <button type="submit" className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
        <Save size={20} /> {initialData ? "Update Student Record" : "Register Student"}
      </button>
    </form>
  );
};

export default StudentForm;