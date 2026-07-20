import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import {
  CICDPage,
  CollectionDetailPage,
  CollectionsPage,
  DashboardPage,
  DockerPage,
  ExecutionDetailPage,
  ExecutionsPage,
  LoginPage,
  NotFoundPage,
  ReportDetailPage,
  ReportsPage,
  SettingsPage,
  TestExecutionPage,
} from "@/pages";
import { paths } from "./paths";

/**
 * Application router. Every page renders inside the DashboardLayout shell.
 */
export const router = createBrowserRouter([
  { path: paths.login, element: <LoginPage /> },
  {
    path: paths.dashboard,
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: paths.collections, element: <CollectionsPage /> },
      { path: paths.collectionDetail(), element: <CollectionDetailPage /> },
      { path: paths.execution, element: <TestExecutionPage /> },
      { path: paths.executions, element: <ExecutionsPage /> },
      { path: paths.executionDetail(), element: <ExecutionDetailPage /> },
      { path: paths.reports, element: <ReportsPage /> },
      { path: paths.reportDetail(), element: <ReportDetailPage /> },
      { path: paths.cicd, element: <CICDPage /> },
      { path: paths.docker, element: <DockerPage /> },
      { path: paths.settings, element: <SettingsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
