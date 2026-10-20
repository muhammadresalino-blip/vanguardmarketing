import { Badge } from '../ui/Badge.jsx'
import { CAMPAIGN_STATUSES, LEAD_STATUSES } from '../../lib/constants.js'

const LEAD_MAP = LEAD_STATUSES.reduce((acc, status) => {
  acc[status.value] = status
  return acc
}, {})

const CAMPAIGN_MAP = CAMPAIGN_STATUSES.reduce((acc, status) => {
  acc[status.value] = status
  return acc
}, {})

export function LeadStatusBadge({ status }) {
  const meta = LEAD_MAP[status] ?? { label: status, tone: 'slate' }
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  )
}

export function CampaignStatusBadge({ status }) {
  const meta = CAMPAIGN_MAP[status] ?? { label: status, tone: 'slate' }
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}

export default LeadStatusBadge
