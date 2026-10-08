import { queryOptions } from '@tanstack/react-query';

import { api, unwrap, type Schemas } from '@/lib/api-client';

export type CompanyRow = Schemas['AdminCompanyRowDto'];
export type CompanyDetail = Schemas['AdminCompanyDetailDto'];

export const companiesQuery = (search: string, status: string) =>
  queryOptions({
    queryKey: ['companies', search, status],
    queryFn: async () =>
      unwrap(
        await api.GET('/v1/admin/companies', {
          params: { query: { search: search || undefined, status: (status || undefined) as never } },
        }),
      ),
  });

export const companyQuery = (employerId: string) =>
  queryOptions({
    queryKey: ['company', employerId],
    queryFn: async () =>
      unwrap(await api.GET('/v1/admin/companies/{employerId}', { params: { path: { employerId } } })),
  });

const path = (employerId: string) => ({ params: { path: { employerId } } });

export async function createCompany(company: Schemas['CreateAdminCompanyDto']): Promise<string> {
  return unwrap(await api.POST('/v1/admin/companies', { body: company })).id;
}

export async function updateCompany(employerId: string, changes: Schemas['UpdateAdminCompanyDto']): Promise<void> {
  unwrap(await api.PATCH('/v1/admin/companies/{employerId}', { ...path(employerId), body: changes }));
}

export async function inviteHr(employerId: string, member: Schemas['AdminInviteHrDto']): Promise<void> {
  unwrap(await api.POST('/v1/admin/companies/{employerId}/members', { ...path(employerId), body: member }));
}
