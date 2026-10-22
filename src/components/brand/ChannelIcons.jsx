import { Link2, Mail, MousePointerClick, Search, Share2 } from 'lucide-react'

// Icon sumber lead — brand penuh (Google, Meta, WhatsApp, LinkedIn) sesuai
// style guide; kanal generik memakai icon outline lucide.

const GoogleIcon = (props) => (
  <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
    <path
      fill="#4285F4"
      d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.964 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9574a8.9965 8.9965 0 0 0 0 4.0836l3.0066 2.3318z"
    />
    <path
      fill="#EA4335"
      d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5814-2.5814C13.4636.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z"
    />
  </svg>
)

const MetaIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <circle cx="8.2" cy="12" r="5.4" stroke="#0064E0" strokeWidth="2.2" />
    <circle cx="15.8" cy="12" r="5.4" stroke="#0081FB" strokeWidth="2.2" />
  </svg>
)

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="12" fill="#25D366" />
    <path
      fill="#fff"
      d="M12 5.8a6.1 6.1 0 0 0-5.3 9.1l-.9 3.3 3.4-.9A6.1 6.1 0 1 0 12 5.8Zm3.5 8.6c-.2.5-1.1.9-1.6.9-.4 0-.9.1-2.9-.8-2.4-1-3.9-3.5-4-3.7-.1-.2-.9-1.2-.9-2.3 0-1.1.6-1.6.8-1.8.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .6.4l.7 1.8c.1.1.1.3 0 .4l-.3.5c-.1.1-.2.3-.1.5.1.2.5 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.7.8c.2.1.3.1.4.3.1.1.1.4 0 .7Z"
    />
  </svg>
)

const LinkedInIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <rect width="24" height="24" rx="5.5" fill="#0A66C2" />
    <path
      fill="#fff"
      d="M8.1 9.7H5.9V18h2.2V9.7ZM7 8.6a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Zm5.7 2.7a2.7 2.7 0 0 0-2.5 1.3V9.7h-2.2V18H10v-4.2c0-1.1.5-1.8 1.5-1.8s1.4.7 1.4 1.8V18h2.2v-4.7c0-2.4-1.2-3.9-3.1-3.9Z"
    />
  </svg>
)

const BRAND = {
  'Google Ads': GoogleIcon,
  'Meta Ads': MetaIcon,
  WhatsApp: WhatsAppIcon,
  LinkedIn: LinkedInIcon,
}

const GENERIC = {
  Direct: MousePointerClick,
  'Email Campaign': Mail,
  'Organic Search': Search,
  Referral: Link2,
  'Social Media': Share2,
}

export function ChannelIcon({ source, className = 'h-4 w-4' }) {
  const Brand = BRAND[source]
  if (Brand) return <Brand className={`${className} shrink-0`} />
  const Icon = GENERIC[source] ?? Share2
  return <Icon className={`${className} shrink-0 text-slate-500`} strokeWidth={1.75} />
}

export default ChannelIcon
