import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, rtdb } from '../../firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, onSnapshot, getDoc } from 'firebase/firestore';
import { ref, get, update } from 'firebase/database';
import { UserPlus, Trash2, Database, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';

interface ApprovedTeacher {
    id: string;
    email: string;
    approvedAt: string;
}

export default function AdminSettings() {
    const { user, isAdmin } = useAuth();
    const [emailToApprove, setEmailToApprove] = useState('');
    const [approvedList, setApprovedList] = useState<ApprovedTeacher[]>([]);
    const [loadingList, setLoadingList] = useState(true);

    // Migration states
    const [migrating, setMigrating] = useState(false);
    const [migrationDone, setMigrationDone] = useState(false);

    useEffect(() => {
        if (!isAdmin) return;
        const q = query(collection(db, 'approved_teachers'));
        const unsub = onSnapshot(q, (snap) => {
            const list: ApprovedTeacher[] = [];
            snap.forEach(d => {
                list.push({ id: d.id, ...d.data() } as ApprovedTeacher);
            });
            setApprovedList(list);
            setLoadingList(false);
        });
        return () => unsub();
    }, [isAdmin]);

    const handleApprove = async () => {
        if (!emailToApprove.trim() || !emailToApprove.includes('@')) return;
        try {
            const id = Date.now().toString(); // simple ID
            await setDoc(doc(db, 'approved_teachers', id), {
                email: emailToApprove.trim().toLowerCase(),
                approvedAt: new Date().toISOString()
            });
            setEmailToApprove('');
        } catch (e) {
            console.error(e);
            alert('Lỗi thêm giáo viên');
        }
    };

    const handleRemove = async (id: string) => {
        if (!window.confirm('Hủy quyền giáo viên này?')) return;
        try {
            await deleteDoc(doc(db, 'approved_teachers', id));
        } catch (e) {
            console.error(e);
            alert('Lỗi xóa giáo viên');
        }
    };

    const handleMigrateData = async () => {
        if (!user || !user.uid) return;
        if (!window.confirm('Toàn bộ DỮ LIỆU CŨ gán vào quyền quản lý của bạn. Bạn chắc chắn chứ?')) return;

        setMigrating(true);
        try {
            // 1. Migrate Exams
            const examsSnap = await getDocs(collection(db, 'exams'));
            const batchExams = examsSnap.docs.map(examDoc => {
                const data = examDoc.data();
                if (!data.authorId) {
                    return setDoc(doc(db, 'exams', examDoc.id), { authorId: user.uid }, { merge: true });
                }
                return Promise.resolve();
            });
            await Promise.all(batchExams);

            // 2. Migrate Rosters (RTDB) (from global to under this teacherUID)
            const rostersSnap = await get(ref(rtdb, 'rosters'));
            if (rostersSnap.exists()) {
                const globalRosters = rostersSnap.val();
                const updates: Record<string, any> = {};
                for (const [classKey, classData] of Object.entries(globalRosters)) {
                    // Move to specific teacher path
                    updates[`rosters/${user.uid}/${classKey}`] = classData;
                    // Delete from global path
                    updates[`rosters/${classKey}`] = null;
                }
                await update(ref(rtdb), updates);
            }

            // 3. Migrate Library RTDB files & videos
            const libFilesSnap = await get(ref(rtdb, 'library_files'));
            const updatesLib: Record<string, any> = {};

            if (libFilesSnap.exists()) {
                const items = libFilesSnap.val();
                for (const [id, itemData] of Object.entries(items)) {
                    if (!(itemData as any).authorId) {
                        updatesLib[`library_files/${id}/authorId`] = user.uid;
                    }
                }
            }
            const libVidSnap = await get(ref(rtdb, 'library_videos'));
            if (libVidSnap.exists()) {
                const items = libVidSnap.val();
                for (const [id, itemData] of Object.entries(items)) {
                    if (!(itemData as any).authorId) {
                        updatesLib[`library_videos/${id}/authorId`] = user.uid;
                    }
                }
            }
            if (Object.keys(updatesLib).length > 0) {
                await update(ref(rtdb), updatesLib);
            }

            setMigrationDone(true);
            alert('Đã chuyển đổi toàn bộ dữ liệu thành công!');
        } catch (error) {
            console.error(error);
            alert('Lỗi cập nhật dữ liệu!');
        } finally {
            setMigrating(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="p-8 text-center text-slate-500 font-medium">
                Khu vực này chỉ dành cho Super Admin.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <ShieldAlert className="text-rose-500" /> QUẢN TRỊ VIÊN HỆ THỐNG
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Approval Section */}
                    <div className="space-y-6">
                        <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                            <h3 className="font-bold text-indigo-700 mb-2">Thêm Giáo Viên bằng Gmail</h3>
                            <p className="text-xs text-indigo-500 mb-4">
                                Giáo viên trong danh sách có thể tạo đề thi, quản lý học sinh và tải liệu riêng.
                            </p>

                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={emailToApprove}
                                    onChange={e => setEmailToApprove(e.target.value)}
                                    className="flex-1 px-4 py-2 text-sm border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 ring-offset-1"
                                    placeholder="Nhập email giáo viên..."
                                />
                                <button
                                    onClick={handleApprove}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                                >
                                    <UserPlus size={16} /> Thêm
                                </button>
                            </div>
                        </div>

                        <div className="border border-slate-100 rounded-2xl overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 font-bold text-sm text-slate-600 border-b border-slate-100">
                                Danh sách đã cấp quyền ({approvedList.length})
                            </div>
                            <div className="max-h-60 overflow-y-auto w-full">
                                {loadingList ? (
                                    <div className="p-4 text-center text-slate-500"><Loader2 className="animate-spin inline-block mr-2" size={16} /> Đang tải...</div>
                                ) : approvedList.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-slate-400">Chưa cấp quyền cho email nào ngoài Super Admin.</div>
                                ) : (
                                    <ul className="divide-y divide-slate-50">
                                        {approvedList.map(item => (
                                            <li key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800">{item.email}</p>
                                                    <p className="text-[10px] text-slate-400">Ngày cấp: {new Date(item.approvedAt).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                                <button onClick={() => handleRemove(item.id)} className="w-8 h-8 flex items-center justify-center text-red-400 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Migration Section */}
                    <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                            <Database size={24} />
                        </div>
                        <h3 className="text-xl font-black text-amber-900 leading-tight">Chuyển Dữ Liệu Cũ</h3>
                        <p className="text-sm text-amber-700 leading-relaxed font-medium">
                            Chức năng chuyển Đề thi, Lớp học, và Tài liệu thư viện đang dùng chung trên toàn hệ thống vào <strong>quyền sở hữu của tài khoản {user?.email}</strong>.
                            Điều này phục vụ việc cách ly dữ liệu sau bản cập nhật bảo mật cá nhân hoá.
                        </p>

                        <button
                            onClick={handleMigrateData}
                            disabled={migrating || migrationDone}
                            className={`w-full py-4 mt-6 rounded-2xl flex items-center justify-center gap-2 font-black text-white shadow-xl transition-all ${migrationDone ? 'bg-emerald-500 shadow-emerald-200 cursor-not-allowed' :
                                    migrating ? 'bg-amber-500 shadow-amber-200 cursor-not-allowed opacity-80' :
                                        'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                                }`}
                        >
                            {migrationDone ? <><CheckCircle2 size={20} /> ĐÃ CHUYỂN DỮ LIỆU</> :
                                migrating ? <><Loader2 size={20} className="animate-spin" /> ĐANG XỬ LÝ...</> :
                                    <><Database size={20} /> MỞ HIỆU LỰC CHUYỂN DỮ LIỆU CŨ</>
                            }
                        </button>
                        <p className="text-[10px] text-amber-600/70 text-center font-bold">Chỉ ấn duy nhất chạy 1 lần.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
