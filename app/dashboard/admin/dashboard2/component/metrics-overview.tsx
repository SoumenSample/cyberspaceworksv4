"use client"

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  BarChart3 
} from "lucide-react"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import React, { useEffect, useState } from "react"

const metrics = [
  {
    title: "Total Revenue",
    value: "$54,230",
    description: "Monthly revenue",
    change: "+12%",
    trend: "up",
    icon: DollarSign,
    footer: "Trending up this month",
    subfooter: "Revenue for the last 6 months"
  },
  {
    title: "Active Customers",
    value: "2,350",
    description: "Total active users",
    change: "+5.2%", 
    trend: "up",
    icon: Users,
    footer: "Strong user retention",
    subfooter: "Engagement exceeds targets"
  },
  {
    title: "Active projects",
    value: "1,247",
    description: "Orders this month",
    change: "-2.1%",
    trend: "down", 
    icon: ShoppingCart,
    footer: "Down 2% this period",
    subfooter: "Order volume needs attention"
  },
  {
    title: "Conversion Rate",
    value: "3.24%",
    description: "Average conversion",
    change: "+8.3%",
    trend: "up",
    icon: BarChart3,
    footer: "Steady performance increase",
    subfooter: "Meets conversion projections"
  },
]

export function MetricsOverview() {
  const [convertedCount, setConvertedCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshSignal, setRefreshSignal] = useState(0);
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [projectError, setProjectError] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState("");

  React.useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (res.ok && data.leads) {
          const count = data.leads.filter((lead: any) => lead.convertedToClient).length;
          setConvertedCount(count);
        } else {
          setConvertedCount(null);
        }
      } catch {
        setConvertedCount(null);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);
   async function loadProjects() {
      try {
        setLoadingProjects(true);
        setProjectError("");
  
        const response = await fetch("/api/projects", { cache: "no-store" });
        const data = await response.json();
        console.log(data);
        setProjects(data.projects.length || []);
        console.log("Projects loaded:", projects);
     
  
  
        
      } catch (error) {
        setProjectError(error.message || "Failed to load projects");
      } finally {
        setLoadingProjects(false);
      }
    }
  
    useEffect(() => {
      loadProjects();
    }, []);
    

  const metrics = [
    {
      title: "Total Revenue",
      value: "$54,230",
      description: "Monthly revenue",
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      footer: "Trending up this month",
      subfooter: "Revenue for the last 6 months"
    },
    {
      title: "Active Customers",
      value: "2,350",
      description: "Total active users",
      change: "+5.2%", 
      trend: "up",
      icon: Users,
      footer: "Strong user retention",
      subfooter: "Engagement exceeds targets"
    },
    {
      title: "Total projects",
      value: projects || "-",
      description: "Orders this month",
      change: "-2.1%",
      trend: "down", 
      icon: ShoppingCart,
      footer: "Down 2% this period",
      subfooter: "Order volume needs attention"
    },
    {
      title: "Conversion Rate",
      value: loading ? "..." : convertedCount !== null ? convertedCount.toString() : "-",
      description: "Leads converted to client",
      change: "+8.3%",
      trend: "up",
      icon: BarChart3,
      footer: "Steady performance increase",
      subfooter: "Meets conversion projections"
    },
  ];

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {metrics.map((metric) => {
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
        
        return (
          <Card key={metric.title} className=" cursor-pointer">
            <CardHeader className="">
              <CardDescription className="">{metric.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metric.value}
              </CardTitle>
              <CardAction className="">
                <Badge className="" variant="outline">
                  <TrendIcon className="h-4 w-4" />
                  {metric.change}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {metric.footer} <TrendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                {metric.subfooter}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}