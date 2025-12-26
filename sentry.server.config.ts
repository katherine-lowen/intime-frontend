import * as Sentry from "@sentry/nextjs";
import { getSentryInitConfig } from "./sentry.config.shared";

Sentry.init(getSentryInitConfig());
