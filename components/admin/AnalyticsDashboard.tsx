"use client";

import { useEffect, useState } from "react";
import { Users, Activity, TrendingUp, AlertTriangle } from "lucide-react";

type NodeStat = {
  nodeId: string;
  nodeName: string;
  branchName: string | null;
  learnerCount: number;
  avgMasteryIndex: number;
};

type AnalyticsData = {
  totalLearners: number;
  activeThisWeek: number;
  nodeStats: NodeStat[];
  topPaths: NodeStat[];
  dropOffs: NodeStat[];
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d: AnalyticsData) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-anvil-gray rounded-xl p-5 border border-steel-edge animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return <p className="text-mist text-sm">Failed to load analytics.</p>;
  }

  const maxLearnerCount = Math.max(...data.topPaths.map((n) => n.learnerCount), 1);

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-anvil-gray rounded-xl p-5 border border-steel-edge">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-arcane-blue" />
            <span className="text-mist text-xs uppercase tracking-wide">
              Total Learners
            </span>
          </div>
          <p className="font-heading text-3xl text-arcane-blue">
            {data.totalLearners}
          </p>
        </div>

        <div className="bg-anvil-gray rounded-xl p-5 border border-steel-edge">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-verdant" />
            <span className="text-mist text-xs uppercase tracking-wide">
              Active This Week
            </span>
          </div>
          <p className="font-heading text-3xl text-verdant">
            {data.activeThisWeek}
          </p>
        </div>
      </div>

      {/* Popular Nodes */}
      <div className="bg-anvil-gray rounded-xl p-5 border border-steel-edge">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-ember-gold" />
          <span className="text-mist text-xs uppercase tracking-wide">
            Popular Nodes
          </span>
        </div>
        {data.topPaths.length === 0 ? (
          <p className="text-mist text-sm">No data yet</p>
        ) : (
          <div className="space-y-2">
            {data.topPaths.map((node) => (
              <div key={node.nodeId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-moonlight text-sm truncate">
                    {node.nodeName}
                  </span>
                  <span className="text-mist text-xs shrink-0 ml-2">
                    {node.learnerCount} learners
                  </span>
                </div>
                <div className="w-full bg-deep-void rounded-full h-2">
                  <div
                    className="bg-ember-gold rounded-full h-2 transition-all"
                    style={{
                      width: `${(node.learnerCount / maxLearnerCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drop-off Nodes */}
      <div className="bg-anvil-gray rounded-xl p-5 border border-steel-edge">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-amber-400" />
          <span className="text-mist text-xs uppercase tracking-wide">
            Drop-off Nodes
          </span>
        </div>
        {data.dropOffs.length === 0 ? (
          <p className="text-mist text-sm">No drop-offs detected</p>
        ) : (
          <div className="space-y-2">
            {data.dropOffs.map((node) => (
              <div
                key={node.nodeId}
                className="flex items-center justify-between py-1"
              >
                <span className="text-moonlight text-sm truncate">
                  {node.nodeName}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-amber-400 text-xs">
                    avg {node.avgMasteryIndex}
                  </span>
                  <span className="text-mist text-xs">
                    {node.learnerCount} stuck
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
