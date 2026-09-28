import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, rtdb } from '../../firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, onSnapshot, getDoc } from 'firebase/firestore';
import { ref, get, update, set, remove } from 'firebase/database';
import { UserPlus, Trash2, Database, ShieldAlert, Loader2, CheckCircle2, FileSpreadsheet, Check, X, Clock, UserCheck } from 'lucide-react';
import GoogleSheetModal from './GoogleSheetModal';
import { teacherWorkspaceService } from '../../services/teacherWorkspaceService';

interface ApprovedTeacher {
    id: string;
    email: string;
    approvedAt: string;
}

interface PendingTeacherRequest {
    id: string;
    email: string;
    name?: string;
    requestedAt: string;
}

export default function AdminSettings() {
    const { user, isAdmin } = useAuth();
    const [emailToApprove, setEmailToApprove] = useState('');
    const [approvedList, setApprovedList] = useState<ApprovedTeacher[]>([]);
    const [pendingRequests, setPendingRequests] = useState<PendingTeacherRequest[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);

    // Migration states
    const [migrating, setMigrating] = useState(false);
    const [migrationDone, setMigrationDone] = useState(false);
    const [showSheetModal, setShowSheetModal] = useState(false);

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

        const qReq = query(collection(db, 'teacher_requests'));
        const unsubReq = onSnapshot(qReq, (snap) => {
            const list: PendingTeacherRequest[] = [];
            snap.forEach(d => {
                list.push({ id: d.id, ...d.data() } as PendingTeacherRequest);
            });
            setPendingRequests(list);
            setLoadingRequests(false);
        });

        return () => {
            unsub();
            unsubReq();
        };
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
        } catch (e: any) {
            console.error(e);
            alert('Lỗi thêm giáo viên: ' + (e?.message || String(e)));
        }
    };

    const handleApproveRequest = async (req: PendingTeacherRequest) => {
        try {
            const id = req.id || Date.now().toString();
            await setDoc(doc(db, 'approved_teachers', id), {
                email: req.email.trim().toLowerCase(),
                approvedAt: new Date().toISOString()
            });
            await deleteDoc(doc(db, 'teacher_requests', req.id));
        } catch (e: any) {
            console.error(e);
            alert('Lỗi phê duyệt: ' + (e?.message || String(e)));
        }
    };

    const handleRejectRequest = async (reqId: string) => {
        if (!window.confirm('Từ chối yêu cầu duyệt này?')) return;
        try {
            await deleteDoc(doc(db, 'teacher_requests', reqId));
        } catch (e: any) {
            console.error(e);
            alert('Lỗi xóa yêu cầu: ' + (e?.message || String(e)));
        }
    };

    const handleRemove = async (id: string) => {
        if (!window.confirm('Hủy quyền giáo viên này?')) return;
        try {
            await deleteDoc(doc(db, 'approved_teachers', id));
        } catch (e: any) {
            console.error(e);
            alert('Lỗi xóa giáo viên: ' + (e?.message || String(e)));
        }
    };

    const handleMigrateData = async () => {
        if (!user || !user.uid) {
            alert('Vui lòng đăng nhập tài khoản trước khi thực hiện chuyển đổi.');
            return;
        }
        if (!window.confirm(`Toàn bộ DỮ LIỆU CŨ sẽ được chuyển vào quyền sở hữu của bạn (${user.email || user.uid}). Bạn chắc chắn chứ?`)) return;

        setMigrating(true);
        try {
            // 1. Migrate Exams in Firestore
            const examsSnap = await getDocs(collection(db, 'exams'));
            const batchExams = examsSnap.docs.map(examDoc => {
                const data = examDoc.data();
                if (!data.authorId) {
                    return setDoc(doc(db, 'exams', examDoc.id), { 
                        authorId: user.uid,
                        authorEmail: user.email || 'lebaochau18042005@gmail.com'
                    }, { merge: true });
                }
                return Promise.resolve();
            });
            await Promise.all(batchExams);

            // 2. Migrate Rosters (RTDB) safely without ancestor collision
            const rostersSnap = await get(ref(rtdb, 'rosters'));
            if (rostersSnap.exists()) {
                const globalRosters = rostersSnap.val();
                for (const [classKey, classData] of Object.entries(globalRosters)) {
                    // Skip existing teacher UID subfolder
                    if (classKey === user.uid) continue;
                    // Only migrate legacy class nodes that contain className or students
                    if (classData && typeof classData === 'object' && ('className' in (classData as object) || 'students' in (classData as object))) {
                        await set(ref(rtdb, `rosters/${user.uid}/${classKey}`), classData);
                        await remove(ref(rtdb, `rosters/${classKey}`));
                    }
                }
            }

            // 3. Migrate Library RTDB files & videos safely
            const libFilesSnap = await get(ref(rtdb, 'library_files'));
            if (libFilesSnap.exists()) {
                const items = libFilesSnap.val();
                for (const [id, itemData] of Object.entries(items)) {
                    if (itemData && typeof itemData === 'object' && !(itemData as any).authorId) {
                        await update(ref(rtdb, `library_files/${id}`), { authorId: user.uid });
                    }
                }
            }
            const libVidSnap = await get(ref(rtdb, 'library_videos'));
            if (libVidSnap.exists()) {
                const items = libVidSnap.val();
                for (const [id, itemData] of Object.entries(items)) {
                    if (itemData && typeof itemData === 'object' && !(itemData as any).authorId) {
                        await update(ref(rtdb, `library_videos/${id}`), { authorId: user.uid });
                    }
                }
            }

            // 4. Migrate Attempts in Firestore (stamp legacy attempts with Admin email)
            const targetEmail = user.email || 'lebaochau18042005@gmail.com';
            const attemptsSnap = await getDocs(collection(db, 'attempts'));
            const batchAttempts = attemptsSnap.docs.map(attDoc => {
                const data = attDoc.data();
                if (!data.teacherEmail) {
                    return setDoc(doc(db, 'attempts', attDoc.id), {
                        teacherEmail: targetEmail
                    }, { merge: true });
                }
                return Promise.resolve();
            });
            await Promise.all(batchAttempts);

            // 5. Migrate Attempts in RTDB
            const rtdbAttemptsSnap = await get(ref(rtdb, 'attempts'));
            if (rtdbAttemptsSnap.exists()) {
                const allAtts = rtdbAttemptsSnap.val();
                for (const [attId, attVal] of Object.entries(allAtts)) {
                    if (attVal && typeof attVal === 'object' && !(attVal as any).teacherEmail) {
                        await update(ref(rtdb, `attempts/${attId}`), {
                            teacherEmail: targetEmail
                        });
                    }
                }
            }

            setMigrationDone(true);
            alert('Đã chuyển đổi toàn bộ dữ liệu thành công!');
        } catch (error: any) {
            console.error('Lỗi khi chuyển đổi dữ liệu:', error);
            alert('Lỗi cập nhật dữ liệu: ' + (error?.message || String(error)));
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
                        {/* Pending Requests Box */}
                        {pendingRequests.length > 0 && (
                            <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-amber-900 text-sm flex items-center gap-2">
                                        <Clock className="text-amber-600" size={18} /> Yêu cầu chờ phê duyệt ({pendingRequests.length})
                                    </h3>
                                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold text-[10px] rounded-full animate-pulse">Cần duyệt</span>
                                </div>
                                <p className="text-xs text-amber-700">Giáo viên đã đăng nhập và gửi yêu cầu cấp quyền truy cập:</p>
                                <ul className="divide-y divide-amber-200/60 bg-white rounded-xl border border-amber-200 overflow-hidden">
                                    {pendingRequests.map(req => (
                                        <li key={req.id} className="p-3 flex items-center justify-between gap-2 hover:bg-amber-50/50 transition-colors">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-xs text-slate-800 truncate">{req.email}</p>
                                                <p className="text-[10px] text-slate-400">{req.name || 'Giáo viên'} • {new Date(req.requestedAt).toLocaleString('vi-VN')}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    onClick={() => handleApproveRequest(req)}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                                                    title="Phê duyệt quyền giáo viên"
                                                >
                                                    <Check size={14} /> Duyệt
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(req.id)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Từ chối yêu cầu"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

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

                    {/* Google Sheets Sync Section */}
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                            <FileSpreadsheet size={24} />
                        </div>
                        <h3 className="text-xl font-black text-emerald-900 leading-tight">Đồng Bộ Google Sheets</h3>
                        <p className="text-sm text-emerald-700 leading-relaxed font-medium">
                            Tự động lưu trữ và đồng bộ hóa kết quả làm bài của học sinh về Google Sheet theo thời gian thực ngay khi nộp bài. Bạn có thể kiểm tra kết nối, cấu hình Webhook và xuất file dữ liệu.
                        </p>

                        <button
                            onClick={() => setShowSheetModal(true)}
                            className="w-full py-4 mt-6 rounded-2xl flex items-center justify-center gap-2 font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all cursor-pointer"
                        >
                            <FileSpreadsheet size={20} /> CẤU HÌNH & QUẢN LÝ GOOGLE SHEETS
                        </button>
                    </div>

                </div>
            </div>

            {/* Google Sheets Management Modal */}
            <GoogleSheetModal
                isOpen={showSheetModal}
                onClose={() => setShowSheetModal(false)}
                teacherEmail={teacherWorkspaceService.getActiveTeacherEmail()}
            />
        </div>
    );
}
