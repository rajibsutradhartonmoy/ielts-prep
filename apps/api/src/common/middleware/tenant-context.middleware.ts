import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { TenantRequest } from '../types/request.types';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: TenantRequest, res: Response, next: NextFunction) {
    // Extract organization ID from various sources
    let tenantId: string | undefined;

    // 1. From header (for API calls)
    tenantId = req.headers['x-organization-id'] as string;

    // 2. From subdomain (e.g., org-slug.yourapp.com)
    if (!tenantId && req.hostname) {
      const subdomain = req.hostname.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        // This could be a slug, we'd need to resolve it to an ID
        // For now, we'll just store it and resolve later
        req.tenantSlug = subdomain;
      }
    }

    // 3. From query parameter (for some cases)
    if (!tenantId && req.query.organizationId) {
      tenantId = req.query.organizationId as string;
    }

    // Store in request object
    if (tenantId) {
      req.tenantId = tenantId;
    }

    next();
  }
}
