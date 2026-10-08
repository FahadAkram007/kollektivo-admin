'use client';

import { InviteMemberForm } from '@/components/ui/invite-member-form';
import { MemberList } from '@/components/ui/member-list';
import { SectionCard } from '@/components/ui/section-card';
import { useAdmin } from '@/features/shell/admin-shell';
import { can } from '@/features/shell/permissions';

import { inviteShopMember, shopQuery, type ShopDetail } from './shops-api';

const ROLES = { owner: 'Inhaber/in', staff: 'Kasse' };

/** People with access to the shop portal. */
export function MembersSection({ shop }: { shop: ShopDetail }) {
  const { role } = useAdmin();
  return (
    <SectionCard title="Händlerportal-Zugänge">
      <MemberList members={shop.members} roleLabels={ROLES} />
      {can.invite(role) && (
        <InviteMemberForm
          roles={[
            { value: 'owner', label: ROLES.owner },
            { value: 'staff', label: ROLES.staff },
          ]}
          invite={(input) => inviteShopMember(shop.partnerId, { ...input, role: input.role as 'owner' | 'staff' })}
          queryKey={shopQuery(shop.partnerId).queryKey}
        />
      )}
    </SectionCard>
  );
}
