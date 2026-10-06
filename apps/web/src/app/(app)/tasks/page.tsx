"use client";

import { Suspense } from "react";
import TasksPage from "./tasks-inner";
import { LoadingBlock } from "@/components/shared/states";
import { PageContainer } from "@/components/layout/page-container";

export default function TasksRoute() {
  return (
    <Suspense
      fallback={
        <PageContainer title="Tasks">
          <LoadingBlock />
        </PageContainer>
      }
    >
      <TasksPage />
    </Suspense>
  );
}
