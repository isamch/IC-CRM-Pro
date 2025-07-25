"use client"

import React, { useRef, useLayoutEffect, useState, useMemo, useEffect, useCallback } from "react"
import { Building2 } from "lucide-react"
import { mockUsers, mockTeams } from "../data/mockData"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom";

// أنواع البيانات
interface AvatarProps {
  name: string
  avatar?: string
}

interface NodeCardProps {
  node: any
}

interface NodePosition {
  id: string
  top: number
  left: number
}

// صورة رمزية
const Avatar: React.FC<AvatarProps> = ({ name, avatar }) => (
  <div className="w-14 h-14 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] rounded-full flex items-center justify-center text-2xl font-bold text-white shadow">
    {avatar ? (
      <img src={avatar || "/placeholder.svg"} alt={name} className="w-full h-full rounded-full object-cover" />
    ) : (
      name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
    )}
  </div>
)

// بطاقة مستخدم أو فريق
const NodeCard: React.FC<NodeCardProps & { highlighted?: boolean; isCurrentUser?: boolean; isAdmin?: boolean }> = ({ node, highlighted = true, isCurrentUser = false, isAdmin = false }) => {
  if (!highlighted) return null;
  return (
    <div className={
      `flex flex-col items-center p-2 bg-[#1e293b] rounded-xl shadow border border-[#334155] min-w-[120px] max-w-[160px] transition-all duration-200 ` +
      (isCurrentUser ? 'ring-4 ring-green-400 shadow-[0_0_16px_4px_rgba(34,197,94,0.5)] z-50' : '')
    }>
      {node.type === "team" ? (
        <div className="w-12 h-12 bg-gradient-to-r from-[#22c55e] to-[#2563eb] rounded-full flex items-center justify-center text-xl font-bold text-white shadow">
          <Building2 className="w-6 h-6" />
        </div>
      ) : (
        <Avatar name={node.name} avatar={node.avatar} />
      )}
      <div className="mt-2 text-center">
        <div className="font-bold text-white">
          {/* إذا كان المستخدم الحالي مدير النظام، اجعل الاسم دائماً كرابط حسب نوع البطاقة */}
          {isAdmin ? (
            <Link
              to={
                node.type === "admin"
                  ? `/users/${node.id}`
                  : node.type === "manager"
                    ? `/sales-managers/${node.id}`
                    : node.type === "rep"
                      ? `/sales-reps/${node.id}`
                      : node.type === "team"
                        ? `/teams/${node.id}`
                        : `#`
              }
              className="hover:underline text-green-400 cursor-pointer transition-colors duration-150"
            >
              {node.name}
            </Link>
          ) : (
            node.name
          )}
        </div>
        {node.email && <div className="text-xs text-[#cbd5e1]">{node.email}</div>}
        {node.region && <div className="text-xs text-[#cbd5e1]">{node.region}</div>}
        <div className="text-xs mt-1">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              node.type === "admin"
                ? "bg-[#7c3aed] text-white"
                : node.type === "manager"
                  ? "bg-[#2563eb] text-white"
                  : node.type === "team"
                    ? "bg-[#334155] text-[#a5b4fc]"
                    : "bg-[#22c55e] text-white"
            }`}
          >
            {node.type === "admin"
              ? "مدير النظام"
              : node.type === "manager"
                ? "مدير المبيعات"
                : node.type === "team"
                  ? "فريق"
                  : "مندوب المبيعات"}
          </span>
        </div>
        {typeof node.isActive === "boolean" && (
          <div className="text-xs text-[#a3e635]">{node.isActive ? "نشط" : "غير نشط"}</div>
        )}
      </div>
    </div>
  )
}

// بناء الشجرة الهرمية حسب دور المستخدم
function buildHierarchy(currentUser: any) {
  const admin = mockUsers.find((u) => u.role === "admin")
  const managers = mockUsers.filter((u) => u.role === "sales_manager")
  const teams = mockTeams
  const reps = mockUsers.filter((u) => u.role === "sales_representative")

  // للجميع: أرجع كل شيء كما يرى الادمن
  const managersWithTeams = managers
    .filter((manager) => !!manager.id)
    .map((manager) => ({
      ...manager,
      type: "manager",
      teams: teams
        .filter((team) => team.managerId === manager.id && !!team.id)
        .map((team) => ({
          ...team,
          type: "team",
          reps: reps
            .filter((rep) => rep.teamId === team.id && !!rep.id)
            .map((rep) => ({
              ...rep,
              type: "rep",
            })),
        })),
    }))
  return { admin: admin && admin.id ? { ...admin, type: "admin" } : null, managers: managersWithTeams }
}

// إعداد متغيرات الأبعاد والمسافات
const CARD_WIDTH = 160
const CARD_HEIGHT = 120
const H_GAP = 60 // المسافة الأفقية بين البطاقات
const V_GAP = 160 // أو أي قيمة تناسبك (مثلاً 180 أو 200)
const CHART_WIDTH = 1200 // عرض المخطط الكلي

// توزيع هرمي حقيقي: كل مدير مع فرقه ومندوبيه في عمود مستقل
function getHierarchicalPositions(hierarchy: any) {
  const positions: NodePosition[] = []
  const CARD_WIDTH = 160
  const CARD_HEIGHT = 120
  const H_GAP = 60
  const V_GAP = 160 // أو أي قيمة تناسبك (مثلاً 180 أو 200)
  const ROOT_TOP = 40
  const CHART_WIDTH = 1200

  // حساب عرض subtree لكل مدير
  function getSubtreeWidth(manager: any) {
    // أوسع صف: الفرق أو أكبر عدد من المندوبين في فريق
    const teamsCount = manager.teams.length
    let maxReps = 0
    manager.teams.forEach((team: any) => {
      if (team.reps.length > maxReps) maxReps = team.reps.length
    })
    const teamRowWidth = teamsCount * CARD_WIDTH + (teamsCount - 1) * H_GAP
    const repsRowWidth = maxReps * CARD_WIDTH + (maxReps - 1) * H_GAP
    return Math.max(CARD_WIDTH, teamRowWidth, repsRowWidth)
  }

  // توزيع المدراء أفقيًا في منتصف المخطط
  const managers = hierarchy.managers
  const subtreeWidths = managers.map(getSubtreeWidth)
  const totalWidth = subtreeWidths.reduce((a: number, b: number) => a + b, 0) + (managers.length - 1) * H_GAP
  let x = (CHART_WIDTH - totalWidth) / 2

  // مدير النظام في الأعلى
  if (hierarchy.admin) {
    positions.push({
      id: `admin-${hierarchy.admin.id}`,
      top: ROOT_TOP,
      left: (CHART_WIDTH - CARD_WIDTH) / 2,
    })
  }

  // لكل مدير: ضع بطاقته، ثم فرقه تحته، ثم مندوبيه تحت كل فريق
  managers.forEach((manager: any, mIdx: number) => {
    const subtreeWidth = subtreeWidths[mIdx]
    // مدير
    const managerLeft = x + (subtreeWidth - CARD_WIDTH) / 2
    const managerTop = ROOT_TOP + CARD_HEIGHT + V_GAP
    positions.push({
      id: `manager-${manager.id}`,
      top: managerTop,
      left: managerLeft,
    })

    // الفرق
    const teams = manager.teams
    const teamsCount = teams.length
    const teamsRowWidth = teamsCount * CARD_WIDTH + (teamsCount - 1) * H_GAP
    const teamX = x + (subtreeWidth - teamsRowWidth) / 2
    const teamTop = managerTop + CARD_HEIGHT + V_GAP
    teams.forEach((team: any, tIdx: number) => {
      positions.push({
        id: `team-${team.id}`,
        top: teamTop,
        left: teamX + tIdx * (CARD_WIDTH + H_GAP),
      })
    })

    // مندوبي كل فريق
    teams.forEach((team: any, tIdx: number) => {
      const reps = team.reps
      const repsCount = reps.length
      if (repsCount === 0) return
      const repsRowWidth = repsCount * CARD_WIDTH + (repsCount - 1) * H_GAP
      const repsX = teamX + tIdx * (CARD_WIDTH + H_GAP) + (CARD_WIDTH - repsRowWidth) / 2
      const repsTop = teamTop + CARD_HEIGHT + V_GAP
      reps.forEach((rep: any, rIdx: number) => {
        positions.push({
          id: `rep-${rep.id}`,
          top: repsTop,
          left: repsX + rIdx * (CARD_WIDTH + H_GAP),
        })
      })
    })
    x += subtreeWidth + H_GAP
  })
  return positions
}

export const OrganizationChart: React.FC = () => {
  const { user: currentUser, loading } = useAuth()
  if (loading) {
    return <div className="p-8 text-center text-gray-500 bg-gray-900 min-h-screen flex items-center justify-center">جاري التحميل...</div>
  }
  const hierarchy = buildHierarchy(currentUser)

  // تحقق من وجود بيانات فعلية
  if (!hierarchy.managers.length) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-900 min-h-screen flex items-center justify-center">
        لا يوجد بيانات لعرض المخطط التنظيمي.
      </div>
    )
  }

  // قائمة كل العناصر (مدير، مدراء، فرق، مندوبي مبيعات)
  const allNodes = useMemo(
    () => [
      ...(hierarchy.admin ? [hierarchy.admin] : []),
      ...hierarchy.managers.flatMap((m: any) => [m, ...m.teams, ...m.teams.flatMap((t: any) => t.reps)]),
    ],
    [hierarchy],
  )

  // --- تحديد البطاقات المسموح بها لمدير المبيعات أو مندوب المبيعات ---
  let highlightedIds = new Set<string>()
  if (currentUser && currentUser.role === 'sales_manager') {
    highlightedIds.add(`manager-${currentUser.id}`)
    hierarchy.managers.forEach((manager: any) => {
      if (manager.id === currentUser.id) {
        const teams = Array.isArray(manager.teams) ? manager.teams : [];
        teams.forEach((team: any) => {
          highlightedIds.add(`team-${team.id}`);
          const reps = Array.isArray(team.reps) ? team.reps : [];
          reps.forEach((rep: any) => {
            highlightedIds.add(`rep-${rep.id}`);
          });
        });
      }
    });
  } else if (currentUser && currentUser.role === 'sales_representative') {
    // منطق مندوب المبيعات
    // ابحث عن الفريق الذي ينتمي إليه المندوب
    const myTeam = mockTeams.find((team) => team.id === currentUser.teamId);
    if (myTeam) {
      highlightedIds.add(`team-${myTeam.id}`);
      // ابحث عن مدير الفريق
      const myManager = mockUsers.find((u) => u.id === myTeam.managerId && u.role === 'sales_manager');
      if (myManager) {
        highlightedIds.add(`manager-${myManager.id}`);
      }
      // أضف جميع مندوبي الفريق
      const myTeamReps = mockUsers.filter((u) => u.teamId === myTeam.id && u.role === 'sales_representative');
      myTeamReps.forEach((rep) => highlightedIds.add(`rep-${rep.id}`));
    }
  } else {
    // كل شيء مسموح للأدوار الأخرى
    allNodes.forEach((node: any) => highlightedIds.add(`${node.type}-${node.id}`));
  }

  // استبدال توزيع المواقع القديم
  const [positions] = useState<NodePosition[]>(() => getHierarchicalPositions(hierarchy))

  // refs لكل عنصر (تهيئة آمنة داخل useEffect)
  const nodeRefs = useRef<{ [id: string]: React.RefObject<HTMLDivElement> }>({})
  useEffect(() => {
    allNodes.forEach((node: any) => {
      const refKey = `${node.type}-${node.id}`
      if (!nodeRefs.current[refKey]) nodeRefs.current[refKey] = React.createRef()
    })
    // eslint-disable-next-line
  }, [allNodes])

  // خطوط بين العناصر
  const [lines, setLines] = useState<{ from: string; to: string }[]>([])

  // بناء الخطوط (من كل عنصر إلى أبوه) بناءً على positions فقط
  useLayoutEffect(() => {
    const newLines: { from: string; to: string }[] = []
    const adminId = hierarchy.admin?.id;
    if (adminId) {
      hierarchy.managers.forEach((manager: any) => {
        newLines.push({ from: `admin-${adminId}`, to: `manager-${manager.id}` })
        manager.teams.forEach((team: any) => {
          newLines.push({ from: `manager-${manager.id}`, to: `team-${team.id}` })
          team.reps.forEach((rep: any) => {
            newLines.push({ from: `team-${team.id}`, to: `rep-${rep.id}` })
          })
        })
      })
    } else {
      // لا يوجد admin: لكل مدير، خط رأسي من نقطة فوقه مباشرة
    hierarchy.managers.forEach((manager: any) => {
        newLines.push({ from: `root-${manager.id}`, to: `manager-${manager.id}` })
      manager.teams.forEach((team: any) => {
        newLines.push({ from: `manager-${manager.id}`, to: `team-${team.id}` })
        team.reps.forEach((rep: any) => {
          newLines.push({ from: `team-${team.id}`, to: `rep-${rep.id}` })
        })
      })
    })
    }
    setLines(newLines)
    // eslint-disable-next-line
  }, [positions])

  // حساب ارتفاع وعرض المخطط تلقائيًا بناءً على توزيع البطاقات
  const maxRight = Math.max(...positions.map((p) => p.left + CARD_WIDTH))
  const maxBottom = Math.max(...positions.map((p) => p.top + CARD_HEIGHT))
  const minLeft = Math.min(...positions.map((p) => p.left))
  const minTop = Math.min(...positions.map((p) => p.top))
  const offsetX = -minLeft < 0 ? 0 : -minLeft
  const chartWidth = maxRight - minLeft + 100 // هامش إضافي
  const chartHeight = maxBottom - minTop + 100 // هامش إضافي

  // حساب مراكز العناصر لرسم الخطوط
  const getCenter = useCallback(
    (id: string) => {
      if (id.startsWith('root-')) {
        // نقطة فوق المدير مباشرة
        const managerId = id.replace('root-', '')
        const pos = positions.find((p) => p.id === `manager-${managerId}`)
        if (!pos) return { x: 0, y: 0 }
        return {
          x: pos.left + offsetX + CARD_WIDTH / 2,
          y: Math.max(pos.top - 40, 0), // 40px فوق البطاقة
        }
      }
      if (id === 'root') {
        // نقطة وهمية في أعلى المخطط، منتصف العرض (احتياط)
        return {
          x: chartWidth / 2,
          y: 0,
        }
      }
      const pos = positions.find((p) => p.id === id)!
      const ref = nodeRefs.current[id]
      if (!pos || !ref?.current) return { x: 0, y: 0 }
      // Use fixed card dimensions for center calculation to avoid layout shifts
      return {
        x: pos.left + offsetX + CARD_WIDTH / 2,
        y: pos.top + CARD_HEIGHT / 2,
      }
    },
    [positions, offsetX, chartWidth],
  )

  // حالة التكبير/التصغير
  const [scale, setScale] = useState(0.6) // القيمة الافتراضية مصغرة
  // حالة السحب (pan)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const panStart = useRef<{ x: number; y: number }>({ ...pan })

  // أحداث السحب
  const handleMouseDown = (e: React.MouseEvent) => {
    // فقط زر الماوس الأيسر
    if (e.button !== 0) return
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    panStart.current = { ...pan }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy })
  }

  const handleMouseUp = () => setDragging(false)

  // --- تركيز البطاقة الخاصة بالمستخدم الحالي في وسط مساحة العمل عند فتح الصفحة ---
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!currentUser) return;
    // حدد id البطاقة الخاصة بالمستخدم الحالي
    let myCardId = '';
    if (currentUser.role === 'admin') myCardId = `admin-${currentUser.id}`;
    else if (currentUser.role === 'sales_manager') myCardId = `manager-${currentUser.id}`;
    else if (currentUser.role === 'sales_representative') myCardId = `rep-${currentUser.id}`;
    else myCardId = '';
    if (!myCardId) return;
    const myPos = positions.find((p) => p.id === myCardId);
    if (!myPos) return;
    const container = containerRef.current;
    if (!container) return;
    // أبعاد مساحة العمل
    const containerRect = container.getBoundingClientRect();
    // مركز البطاقة
    const cardCenterX = myPos.left + offsetX + CARD_WIDTH / 2;
    const cardCenterY = myPos.top + CARD_HEIGHT / 2;
    // مركز مساحة العمل
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;
    // احسب pan المطلوب (مع مراعاة scale)
    setPan({
      x: (containerCenterX - cardCenterX * scale),
      y: (containerCenterY - cardCenterY * scale),
    });
    // eslint-disable-next-line
  }, [currentUser, positions, scale, offsetX]);

  // رسم الخطوط بزوايا قائمة (L-shape)
  const getLShapePath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    // خط عمودي من النقطة الأولى لنصف المسافة، ثم أفقي للنقطة الثانية
    const midY = (from.y + to.y) / 2
    return `M${from.x},${from.y} L${from.x},${midY} L${to.x},${midY} L${to.x},${to.y}`
  }

  // معالج أحداث عجلة الماوس/لوحة اللمس للتكبير/التصغير
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // تحقق من مفتاح Ctrl (لـ Windows/Linux) أو Meta (لـ Mac) للتكبير/التصغير بالقرص
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault() // منع سلوك التكبير/التصغير الافتراضي للمتصفح

      const zoomAmount = e.deltaY * -0.005 // ضبط الحساسية
      setScale((s) => Math.max(0.3, Math.min(2, s + zoomAmount)))
    }
  }, [])

  // معالج أحداث لوحة المفاتيح للتكبير/التصغير
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === "ArrowUp") {
          e.preventDefault() // منع التمرير الافتراضي للمتصفح
          setScale((s) => Math.min(2, s + 0.1))
        } else if (e.key === "ArrowDown") {
          e.preventDefault() // منع التمرير الافتراضي للمتصفح
          setScale((s) => Math.max(0.3, s - 0.1))
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // منع تحديد النص أثناء السحب
  useEffect(() => {
    if (dragging) {
      document.body.style.userSelect = "none"
    } else {
      document.body.style.userSelect = ""
    }
    return () => {
      document.body.style.userSelect = ""
    }
  }, [dragging])

  // تحسين مظهر الخلفية والبطاقات
  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#2563eb] overflow-hidden">
      <div className="relative w-full h-full" ref={containerRef}>
        {/* أزرار التحكم في التكبير/التصغير مثبتة دائماً في الزاوية العليا اليمنى من مساحة العمل */}
        <div className="absolute top-6 right-6 z-[9999] flex gap-2 bg-white/80 rounded shadow p-2">
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-lg font-bold"
            onClick={() => setScale((s) => Math.max(0.3, s - 0.1))}
          >
            -
          </button>
          <span className="px-2 font-mono">{(scale * 100).toFixed(0)}%</span>
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-lg font-bold"
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
          >
            +
          </button>
        </div>
        {/* مساحة العمل الثابتة بدون أي scroll */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel} // إضافة معالج أحداث عجلة الماوس/لوحة اللمس
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transition: dragging ? "none" : "transform 0.2s",
              width: chartWidth,
              height: chartHeight,
              background: "none",
            }}
          >
            {/* خطوط بين الصفوف (اختياري) */}
            <div
              className="absolute left-0 w-full"
              style={{ top: CARD_HEIGHT + 40 + V_GAP / 2, height: 2, background: "rgba(120,130,180,0.04)" }}
            />
            <div
              className="absolute left-0 w-full"
              style={{
                top: 2 * (CARD_HEIGHT + V_GAP) + 40 + V_GAP / 2,
                height: 2,
                background: "rgba(120,130,180,0.04)",
              }}
            />
            <div
              className="absolute left-0 w-full"
              style={{
                top: 3 * (CARD_HEIGHT + V_GAP) + 40 + V_GAP / 2,
                height: 2,
                background: "rgba(120,130,180,0.04)",
              }}
            />
            {/* خطوط SVG احترافية بين المستويات */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
              {/* خطوط بين المدير والفرق */}
              {hierarchy.managers.map((manager: any) => {
                const managerPos = positions.find((p) => p.id === `manager-${manager.id}`)
                if (!managerPos) return null
                const teams = manager.teams || []
                // فقط الفرق المسموح بها
                const teamPositions = teams
                  .map((team: any) => positions.find((p) => p.id === `team-${team.id}`))
                  .filter((tp: any) => tp && highlightedIds.has(`team-${tp.id}`))
                if (teamPositions.length < 1 || !highlightedIds.has(`manager-${manager.id}`)) return null
                // خط رأسي من أسفل المدير إلى الخط الأفقي (إذا كان هناك أكثر من فريق)
                const mx = managerPos.left + offsetX + CARD_WIDTH / 2
                const my1 = managerPos.top + CARD_HEIGHT
                // الخط الأفقي بين الفرق
                const tx1 = Math.min(...teamPositions.map((tp: any) => tp.left + offsetX + CARD_WIDTH / 2))
                const tx2 = Math.max(...teamPositions.map((tp: any) => tp.left + offsetX + CARD_WIDTH / 2))
                const ty = teamPositions[0].top - V_GAP / 2
                return (
                  <g key={`manager-teams-${manager.id}`}>
                    {/* خط رأسي من المدير إلى الخط الأفقي */}
                    {teamPositions.length > 1 && (
                      <line x1={mx} y1={my1} x2={mx} y2={ty} stroke="#7b8bbd" strokeWidth={2} />
                    )}
                    {/* خط أفقي بين الفرق */}
                    {teamPositions.length > 1 && (
                      <line x1={tx1} y1={ty} x2={tx2} y2={ty} stroke="#7b8bbd" strokeWidth={2} />
                    )}
                    {/* خطوط رأسية من الخط الأفقي إلى كل فريق */}
                    {teamPositions.length > 1 && teamPositions.map((tp: any, idx: number) => (
                      <line
                        key={`team-vertical-${tp.id}`}
                        x1={tp.left + offsetX + CARD_WIDTH / 2}
                        y1={ty}
                        x2={tp.left + offsetX + CARD_WIDTH / 2}
                        y2={tp.top}
                        stroke="#7b8bbd"
                        strokeWidth={2}
                      />
                    ))}
                    {/* إذا كان هناك فريق واحد فقط، خط رأسي مباشر */}
                    {teamPositions.length === 1 && (
                      <line
                        x1={mx}
                        y1={my1}
                        x2={teamPositions[0].left + offsetX + CARD_WIDTH / 2}
                        y2={teamPositions[0].top}
                        stroke="#7b8bbd"
                        strokeWidth={2}
                      />
                    )}
                  </g>
                )
              })}
              {/* خطوط بين الفرق والمندوبين */}
              {hierarchy.managers.flatMap((manager: any) =>
                (manager.teams || []).map((team: any) => {
                  const teamPos = positions.find((p) => p.id === `team-${team.id}`)
                  if (!teamPos || !highlightedIds.has(`team-${team.id}`)) return null
                  const reps = team.reps || []
                  // فقط المندوبين المسموح بهم
                  const repPositions = reps
                    .map((rep: any) => positions.find((p) => p.id === `rep-${rep.id}`))
                    .filter((rp: any) => rp && highlightedIds.has(`rep-${rp.id}`))
                  if (repPositions.length < 1) return null
                  // خط رأسي من أسفل الفريق إلى الخط الأفقي (إذا كان هناك أكثر من مندوب)
                  const tx = teamPos.left + offsetX + CARD_WIDTH / 2
                  const ty1 = teamPos.top + CARD_HEIGHT
                  // الخط الأفقي بين المندوبين
                  const rx1 = Math.min(...repPositions.map((rp: any) => rp.left + offsetX + CARD_WIDTH / 2))
                  const rx2 = Math.max(...repPositions.map((rp: any) => rp.left + offsetX + CARD_WIDTH / 2))
                  const ry = repPositions[0].top - V_GAP / 2
                  return (
                    <g key={`team-reps-${team.id}`}>
                      {/* خط رأسي من الفريق إلى الخط الأفقي */}
                      {repPositions.length > 1 && (
                        <line x1={tx} y1={ty1} x2={tx} y2={ry} stroke="#7b8bbd" strokeWidth={2} />
                      )}
                      {/* خط أفقي بين المندوبين */}
                      {repPositions.length > 1 && (
                        <line x1={rx1} y1={ry} x2={rx2} y2={ry} stroke="#7b8bbd" strokeWidth={2} />
                      )}
                      {/* خطوط رأسية من الخط الأفقي إلى كل مندوب */}
                      {repPositions.length > 1 && repPositions.map((rp: any, idx: number) => (
                        <line
                          key={`rep-vertical-${rp.id}`}
                          x1={rp.left + offsetX + CARD_WIDTH / 2}
                          y1={ry}
                          x2={rp.left + offsetX + CARD_WIDTH / 2}
                          y2={rp.top}
                          stroke="#7b8bbd"
                          strokeWidth={2}
                        />
                      ))}
                      {/* إذا كان هناك مندوب واحد فقط، خط رأسي مباشر */}
                      {repPositions.length === 1 && (
                        <line
                          x1={tx}
                          y1={ty1}
                          x2={repPositions[0].left + offsetX + CARD_WIDTH / 2}
                          y2={repPositions[0].top}
                          stroke="#7b8bbd"
                          strokeWidth={2}
                        />
                      )}
                    </g>
                  )
                })
              )}
              {/* خطوط L-shape القديمة (احتياط أو admin فقط) */}
              {lines
                .filter(line => {
                  // إذا كان مدير مبيعات أو مندوب مبيعات، اعرض فقط الخطوط التي تربط بين عناصر مسموح بها
                  if (
                    currentUser &&
                    (currentUser.role === 'sales_manager' || currentUser.role === 'sales_representative')
                  ) {
                    return highlightedIds.has(line.from) && highlightedIds.has(line.to);
                  }
                  // للأدوار الأخرى، اعرض كل الخطوط
                  return true;
                })
                .map((line, idx) => {
                const from = getCenter(line.from)
                const to = getCenter(line.to)
                return (
                  <path
                    key={idx}
                    d={getLShapePath(from, to)}
                    fill="none"
                    stroke="#7b8bbd"
                    strokeWidth={2}
                    markerEnd="url(#arrowhead)"
                  />
                )
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L8,3 z" fill="#7b8bbd" />
                </marker>
              </defs>
            </svg>
            {/* العناصر */}
            {allNodes
              .filter((node: any) => node && node.id)
              .map((node: any) => {
                const refKey = `${node.type}-${node.id}`
                const pos = positions.find((p) => p.id === refKey)
                if (!pos) return null
                if (!highlightedIds.has(refKey)) return null;
                // تحقق هل هذه بطاقة المستخدم الحالي
                let isCurrentUser = false;
                if (currentUser) {
                  if (currentUser.role === 'admin' && refKey === `admin-${currentUser.id}`) isCurrentUser = true;
                  if (currentUser.role === 'sales_manager' && refKey === `manager-${currentUser.id}`) isCurrentUser = true;
                  if (currentUser.role === 'sales_representative' && refKey === `rep-${currentUser.id}`) isCurrentUser = true;
                }
                // تحقق هل المستخدم الحالي مدير النظام
                const isAdmin = !!(currentUser && currentUser.role === 'admin');
                return (
                  <div
                    key={refKey}
                    ref={nodeRefs.current[refKey]}
                    style={{
                      position: "absolute",
                      top: pos.top,
                      left: pos.left + offsetX,
                      width: CARD_WIDTH,
                      height: CARD_HEIGHT,
                      zIndex: 10,
                      userSelect: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <NodeCard node={node} highlighted={true} isCurrentUser={isCurrentUser} isAdmin={isAdmin} />
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
