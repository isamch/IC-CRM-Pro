import React, { useRef, useLayoutEffect, useState, useMemo, useEffect } from 'react';
import { mockUsers, mockTeams } from '../data/mockData';
import { Building2 } from 'lucide-react';

// أنواع البيانات
interface AvatarProps {
  name: string;
  avatar?: string;
}
interface NodeCardProps {
  node: any;
}
interface NodePosition {
  id: string;
  top: number;
  left: number;
}

// صورة رمزية
const Avatar: React.FC<AvatarProps> = ({ name, avatar }) => (
  <div className="w-14 h-14 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] rounded-full flex items-center justify-center text-2xl font-bold text-white shadow">
    {avatar ? (
      <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
    ) : (
      name.split(' ').map((n: string) => n[0]).join('')
    )}
  </div>
);

// بطاقة مستخدم أو فريق
const NodeCard: React.FC<NodeCardProps> = ({ node }) => (
  <div className="flex flex-col items-center p-2 bg-[#1e293b] rounded-xl shadow border border-[#334155] min-w-[120px] max-w-[160px]">
    {node.type === 'team' ? (
      <div className="w-12 h-12 bg-gradient-to-r from-[#22c55e] to-[#2563eb] rounded-full flex items-center justify-center text-xl font-bold text-white shadow">
        <Building2 className="w-6 h-6" />
      </div>
    ) : (
      <Avatar name={node.name} avatar={node.avatar} />
    )}
    <div className="mt-2 text-center">
      <div className="font-bold text-white">{node.name}</div>
      {node.email && <div className="text-xs text-[#cbd5e1]">{node.email}</div>}
      {node.region && <div className="text-xs text-[#cbd5e1]">{node.region}</div>}
      <div className="text-xs mt-1">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          node.type === 'admin'
            ? 'bg-[#7c3aed] text-white'
            : node.type === 'manager'
            ? 'bg-[#2563eb] text-white'
            : node.type === 'team'
            ? 'bg-[#334155] text-[#a5b4fc]'
            : 'bg-[#22c55e] text-white'
        }`}>
          {node.type === 'admin'
            ? 'مدير النظام'
            : node.type === 'manager'
            ? 'مدير المبيعات'
            : node.type === 'team'
            ? 'فريق'
            : 'مندوب المبيعات'}
        </span>
      </div>
      {typeof node.isActive === 'boolean' && (
        <div className="text-xs text-[#a3e635]">{node.isActive ? 'نشط' : 'غير نشط'}</div>
      )}
    </div>
  </div>
);

// بناء الشجرة الهرمية الحقيقية
function buildHierarchy() {
  const admin = mockUsers.find(u => u.role === 'admin');
  const managers = mockUsers.filter(u => u.role === 'sales_manager');
  const teams = mockTeams;
  const reps = mockUsers.filter(u => u.role === 'sales_representative');

  // لكل مدير: اجلب الفرق التي يديرها
  const managersWithTeams = managers
    .filter(manager => !!manager.id)
    .map(manager => ({
      ...manager,
      type: 'manager',
      teams: teams.filter(team => team.managerId === manager.id && !!team.id).map(team => ({
        ...team,
        type: 'team',
        reps: reps.filter(rep => rep.teamId === team.id && !!rep.id).map(rep => ({
          ...rep,
          type: 'rep'
        }))
      }))
    }));

  return { admin: admin && admin.id ? { ...admin, type: 'admin' } : null, managers: managersWithTeams };
}

// إعداد متغيرات الأبعاد والمسافات
const CARD_WIDTH = 160;
const CARD_HEIGHT = 120;
const H_GAP = 60; // المسافة الأفقية بين البطاقات
const V_GAP = 160; // أو أي قيمة تناسبك (مثلاً 180 أو 200)
const CHART_WIDTH = 1200; // عرض المخطط الكلي

// توزيع هرمي حقيقي: كل مدير مع فرقه ومندوبيه في عمود مستقل
function getHierarchicalPositions(hierarchy: any) {
  const positions: NodePosition[] = [];
  const CARD_WIDTH = 160;
  const CARD_HEIGHT = 120;
  const H_GAP = 60;
  const V_GAP = 160; // أو أي قيمة تناسبك (مثلاً 180 أو 200)
  const ROOT_TOP = 40;
  const CHART_WIDTH = 1200;

  // حساب عرض subtree لكل مدير
  function getSubtreeWidth(manager: any) {
    // أوسع صف: الفرق أو أكبر عدد من المندوبين في فريق
    const teamsCount = manager.teams.length;
    let maxReps = 0;
    manager.teams.forEach((team: any) => {
      if (team.reps.length > maxReps) maxReps = team.reps.length;
    });
    const teamRowWidth = teamsCount * CARD_WIDTH + (teamsCount - 1) * H_GAP;
    const repsRowWidth = maxReps * CARD_WIDTH + (maxReps - 1) * H_GAP;
    return Math.max(CARD_WIDTH, teamRowWidth, repsRowWidth);
  }

  // توزيع المدراء أفقيًا في منتصف المخطط
  const managers = hierarchy.managers;
  const subtreeWidths = managers.map(getSubtreeWidth);
  const totalWidth = subtreeWidths.reduce((a: number, b: number) => a + b, 0) + (managers.length - 1) * H_GAP;
  let x = (CHART_WIDTH - totalWidth) / 2;

  // مدير النظام في الأعلى
  if (hierarchy.admin) {
    positions.push({
      id: `admin-${hierarchy.admin.id}`,
      top: ROOT_TOP,
      left: (CHART_WIDTH - CARD_WIDTH) / 2,
    });
  }

  // لكل مدير: ضع بطاقته، ثم فرقه تحته، ثم مندوبيه تحت كل فريق
  managers.forEach((manager: any, mIdx: number) => {
    const subtreeWidth = subtreeWidths[mIdx];
    // مدير
    const managerLeft = x + (subtreeWidth - CARD_WIDTH) / 2;
    const managerTop = ROOT_TOP + CARD_HEIGHT + V_GAP;
    positions.push({
      id: `manager-${manager.id}`,
      top: managerTop,
      left: managerLeft,
    });
    // الفرق
    const teams = manager.teams;
    const teamsCount = teams.length;
    const teamsRowWidth = teamsCount * CARD_WIDTH + (teamsCount - 1) * H_GAP;
    let teamX = x + (subtreeWidth - teamsRowWidth) / 2;
    const teamTop = managerTop + CARD_HEIGHT + V_GAP;
    teams.forEach((team: any, tIdx: number) => {
      positions.push({
        id: `team-${team.id}`,
        top: teamTop,
        left: teamX + tIdx * (CARD_WIDTH + H_GAP),
      });
    });
    // مندوبي كل فريق
    teams.forEach((team: any, tIdx: number) => {
      const reps = team.reps;
      const repsCount = reps.length;
      if (repsCount === 0) return;
      const repsRowWidth = repsCount * CARD_WIDTH + (repsCount - 1) * H_GAP;
      const repsX = teamX + tIdx * (CARD_WIDTH + H_GAP) + (CARD_WIDTH - repsRowWidth) / 2;
      const repsTop = teamTop + CARD_HEIGHT + V_GAP;
      reps.forEach((rep: any, rIdx: number) => {
        positions.push({
          id: `rep-${rep.id}`,
          top: repsTop,
          left: repsX + rIdx * (CARD_WIDTH + H_GAP),
        });
      });
    });
    x += subtreeWidth + H_GAP;
  });
  return positions;
}

export const OrganizationChart: React.FC = () => {
  const hierarchy = buildHierarchy();

  // تحقق من وجود بيانات فعلية
  if (!hierarchy.admin || !hierarchy.managers.length) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-900 min-h-screen flex items-center justify-center">
        لا يوجد بيانات لعرض المخطط التنظيمي.
      </div>
    );
  }

  // قائمة كل العناصر (مدير، مدراء، فرق، مندوبي مبيعات)
  const allNodes = useMemo(() => [
    ...(hierarchy.admin ? [hierarchy.admin] : []),
    ...hierarchy.managers.flatMap((m: any) => [m, ...m.teams, ...m.teams.flatMap((t: any) => t.reps)])
  ], [hierarchy]);

  // استبدال توزيع المواقع القديم
  const [positions] = useState<NodePosition[]>(() => getHierarchicalPositions(hierarchy));

  // refs لكل عنصر (تهيئة آمنة داخل useEffect)
  const nodeRefs = useRef<{ [id: string]: React.RefObject<HTMLDivElement> }>({});
  useEffect(() => {
    allNodes.forEach((node: any) => {
      const refKey = `${node.type}-${node.id}`;
      if (!nodeRefs.current[refKey]) nodeRefs.current[refKey] = React.createRef();
    });
    // eslint-disable-next-line
  }, [allNodes]);

  // خطوط بين العناصر
  const [lines, setLines] = useState<{ from: string; to: string }[]>([]);

  // بناء الخطوط (من كل عنصر إلى أبوه) بناءً على positions فقط
  useLayoutEffect(() => {
    const newLines: { from: string; to: string }[] = [];
    hierarchy.managers.forEach((manager: any) => {
      if (hierarchy.admin && hierarchy.admin.id) {
        newLines.push({ from: `admin-${hierarchy.admin.id}`, to: `manager-${manager.id}` });
      }
      manager.teams.forEach((team: any) => {
        newLines.push({ from: `manager-${manager.id}`, to: `team-${team.id}` });
        team.reps.forEach((rep: any) => {
          newLines.push({ from: `team-${team.id}`, to: `rep-${rep.id}` });
        });
      });
    });
    setLines(newLines);
    // eslint-disable-next-line
  }, [positions]);

  // حساب مراكز العناصر لرسم الخطوط
  const getCenter = (id: string) => {
    const pos = positions.find(p => p.id === id)!;
    const ref = nodeRefs.current[id];
    if (!pos || !ref?.current) return { x: 0, y: 0 };
    const rect = ref.current.getBoundingClientRect();
    return {
      x: pos.left + rect.width / 2,
      y: pos.top + rect.height / 2,
    };
  };

  // رسم الخطوط بزوايا قائمة (L-shape)
  const getLShapePath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    // خط عمودي من النقطة الأولى لنصف المسافة، ثم أفقي للنقطة الثانية
    const midY = (from.y + to.y) / 2;
    return `M${from.x},${from.y} L${from.x},${midY} L${to.x},${midY} L${to.x},${to.y}`;
  };

  // حالة التكبير/التصغير
  const [scale, setScale] = useState(0.6); // القيمة الافتراضية مصغرة
  // حالة السحب (pan)
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // أحداث السحب
  const handleMouseDown = (e: React.MouseEvent) => {
    // فقط زر الماوس الأيسر
    if (e.button !== 0) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  };
  const handleMouseUp = () => setDragging(false);

  // منع تحديد النص أثناء السحب
  useEffect(() => {
    if (dragging) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    return () => {
      document.body.style.userSelect = '';
    };
  }, [dragging]);

  // حساب ارتفاع المخطط تلقائيًا بناءً على توزيع البطاقات
  const chartHeight = Math.max(...positions.map(p => p.top + CARD_HEIGHT)) + 40; // 40 هامش سفلي
  const chartWidth = CHART_WIDTH + 40; // هامش جانبي

  // تحسين مظهر الخلفية والبطاقات
  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#2563eb] overflow-hidden">
      <div className="relative w-full h-full">
        {/* أزرار التحكم في التكبير/التصغير مثبتة دائماً في الزاوية العليا اليمنى من مساحة العمل */}
        <div className="absolute top-6 right-6 z-[9999] flex gap-2 bg-white/80 rounded shadow p-2">
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-lg font-bold"
            onClick={() => setScale(s => Math.max(0.3, s - 0.1))}
          >-
          </button>
          <span className="px-2 font-mono">{(scale * 100).toFixed(0)}%</span>
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-lg font-bold"
            onClick={() => setScale(s => Math.min(2, s + 0.1))}
          >+
          </button>
        </div>
        {/* مساحة العمل الثابتة بدون أي scroll */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transition: dragging ? 'none' : 'transform 0.2s',
              width: chartWidth,
              height: chartHeight,
              background: 'none',
            }}
          >
            {/* خطوط بين الصفوف (اختياري) */}
            <div className="absolute left-0 w-full" style={{ top: CARD_HEIGHT + 40 + V_GAP / 2, height: 2, background: 'rgba(120,130,180,0.04)' }} />
            <div className="absolute left-0 w-full" style={{ top: 2 * (CARD_HEIGHT + V_GAP) + 40 + V_GAP / 2, height: 2, background: 'rgba(120,130,180,0.04)' }} />
            <div className="absolute left-0 w-full" style={{ top: 3 * (CARD_HEIGHT + V_GAP) + 40 + V_GAP / 2, height: 2, background: 'rgba(120,130,180,0.04)' }} />
            {/* خطوط SVG بزوايا قائمة */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
              {lines.map((line, idx) => {
                const from = getCenter(line.from);
                const to = getCenter(line.to);
                return (
                  <path
                    key={idx}
                    d={getLShapePath(from, to)}
                    fill="none"
                    stroke="#7b8bbd"
                    strokeWidth={2}
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L8,3 z" fill="#7b8bbd" />
                </marker>
              </defs>
            </svg>
            {/* العناصر */}
            {allNodes
              .filter((node: any) => node && node.id)
              .map((node: any) => {
                const refKey = `${node.type}-${node.id}`;
                const pos = positions.find(p => p.id === refKey);
                if (!pos) return null;
                return (
                  <div
                    key={refKey}
                    ref={nodeRefs.current[refKey]}
                    style={{
                      position: 'absolute',
                      top: pos.top,
                      left: pos.left,
                      width: CARD_WIDTH,
                      height: CARD_HEIGHT,
                      zIndex: 10,
                      userSelect: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <NodeCard node={node} />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}; 