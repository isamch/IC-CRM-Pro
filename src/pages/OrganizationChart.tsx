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
  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow">
    {avatar ? (
      <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
    ) : (
      name.split(' ').map((n: string) => n[0]).join('')
    )}
  </div>
);

// بطاقة مستخدم أو فريق
const NodeCard: React.FC<NodeCardProps> = ({ node }) => (
  <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 min-w-[120px] max-w-[160px]">
    {node.type === 'team' ? (
      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-xl font-bold text-white shadow">
        <Building2 className="w-6 h-6" />
      </div>
    ) : (
      <Avatar name={node.name} avatar={node.avatar} />
    )}
    <div className="mt-2 text-center">
      <div className="font-bold text-gray-900 dark:text-white">{node.name}</div>
      {node.email && <div className="text-xs text-gray-500 dark:text-gray-400">{node.email}</div>}
      {node.region && <div className="text-xs text-gray-500 dark:text-gray-400">{node.region}</div>}
      <div className="text-xs mt-1">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          node.type === 'admin'
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            : node.type === 'manager'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : node.type === 'team'
            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
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
        <div className="text-xs text-gray-400">{node.isActive ? 'نشط' : 'غير نشط'}</div>
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

// توزيع تلقائي منظم (صفوف)
function getInitialPositions(hierarchy: any) {
  const positions: NodePosition[] = [];
  const rowHeight = 180;
  const colWidth = 180;
  // المدير في الأعلى
  positions.push({ id: hierarchy.admin.id!, top: 0, left: 600 });
  // المدراء
  const managers = hierarchy.managers;
  const managerRow = 1;
  managers.forEach((manager: any, i: number) => {
    positions.push({ id: manager.id, top: managerRow * rowHeight, left: 200 + i * colWidth * 2 });
    // الفرق
    const teamRow = 2;
    manager.teams.forEach((team: any, j: number) => {
      positions.push({ id: team.id, top: teamRow * rowHeight, left: 120 + i * colWidth * 2 + j * colWidth });
      // المندوبين
      const repRow = 3;
      team.reps.forEach((rep: any, k: number) => {
        positions.push({ id: rep.id, top: repRow * rowHeight, left: 100 + i * colWidth * 2 + j * colWidth + k * 120 });
      });
    });
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

  // حفظ أماكن كل عنصر
  const [positions, setPositions] = useState<NodePosition[]>(() => {
    // توزيع أولي يبدأ من left/top صغيرة
    const positions: NodePosition[] = [];
    const rowHeight = 180;
    const colWidth = 180;
    positions.push({ id: `admin-${hierarchy.admin!.id}`, top: 40, left: 400 });
    const managers = hierarchy.managers;
    const managerRow = 1;
    managers.forEach((manager: any, i: number) => {
      positions.push({ id: `manager-${manager.id}`, top: managerRow * rowHeight + 40, left: 100 + i * colWidth * 2 });
      const teamRow = 2;
      manager.teams.forEach((team: any, j: number) => {
        positions.push({ id: `team-${team.id}`, top: teamRow * rowHeight + 40, left: 80 + i * colWidth * 2 + j * colWidth });
        const repRow = 3;
        team.reps.forEach((rep: any, k: number) => {
          positions.push({ id: `rep-${rep.id}`, top: repRow * rowHeight + 40, left: 60 + i * colWidth * 2 + j * colWidth + k * 120 });
        });
      });
    });
    return positions;
  });

  // refs لكل عنصر (تهيئة آمنة داخل useEffect)
  const nodeRefs = useRef<{ [id: string]: React.RefObject<HTMLDivElement> }>({});
  useEffect(() => {
    allNodes.forEach((node: any) => {
      const refKey = `${node.type}-${node.id}`;
      if (!nodeRefs.current[refKey]) nodeRefs.current[refKey] = React.createRef();
    });
    // eslint-disable-next-line
  }, [allNodes]);

  // drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // drag events
  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    setDragId(id);
    const pos = positions.find(p => p.id === id);
    if (pos) {
      setOffset({ x: e.clientX - pos.left, y: e.clientY - pos.top });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragId) return;
    setPositions(positions =>
      positions.map(p =>
        p.id === dragId
          ? { ...p, left: e.clientX - offset.x, top: e.clientY - offset.y }
          : p
      )
    );
  };
  const handleMouseUp = () => setDragId(null);

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

  return (
    <div
      className="relative w-full min-h-screen bg-gray-900"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ minWidth: 1200 }}
    >
      {/* خطوط SVG */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {lines.map((line, idx) => {
          const from = getCenter(line.from);
          const to = getCenter(line.to);
          return (
            <line
              key={idx}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#94a3b8"
              strokeWidth={2}
              markerEnd="url(#arrowhead)"
            />
          );
        })}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
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
                cursor: 'grab',
                zIndex: 10,
                userSelect: 'none',
              }}
              onMouseDown={e => handleMouseDown(refKey, e)}
            >
              <NodeCard node={node} />
            </div>
          );
        })}
    </div>
  );
}; 