import EmailIcon from '@mui/icons-material/Email'
import GitHubIcon from '@mui/icons-material/GitHub'
import InstagramIcon from '@mui/icons-material/Instagram'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import TelegramIcon from '@mui/icons-material/Telegram'
import type { SvgIconComponent } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { UserRow } from '@/entities/user'
import styles from './CreatorsContent.module.scss'

/** Ссылка на соцсеть в карточке создателя. */
interface CreatorSocialLink {
  /** Иконка платформы. */
  icon: SvgIconComponent
  /** Подпись для читалок экрана и подсказки при наведении. */
  label: string
  /** Адрес профиля. */
  url: string
}

/** Ключ роли — соответствует `settings.sections.creators.roles.<roleKey>` в локали. */
type CreatorRoleKey = 'frontend' | 'backend' | 'designer'

/** Один человек в списке создателей. */
interface Creator {
  /** Ключ роли — переводится в `CreatorsContent`, выводится текстом над карточкой. */
  roleKey: CreatorRoleKey
  /** Отображаемое имя. */
  displayName: string
  /** Ссылки на соцсети. */
  links: CreatorSocialLink[]
}

const GITHUB_USERNAME = 'Hydrobee3000'
const CREATOR_AVATAR_URL = `https://github.com/${GITHUB_USERNAME}.png`

const CREATOR_LINKS: CreatorSocialLink[] = [
  {
    icon: LinkedInIcon,
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/aleksei-zaikin-891343255/',
  },
  { icon: TelegramIcon, label: 'Telegram', url: 'https://t.me/hydrombee' },
  { icon: GitHubIcon, label: 'GitHub', url: `https://github.com/${GITHUB_USERNAME}` },
  { icon: InstagramIcon, label: 'Instagram', url: 'https://www.instagram.com/le_schat/' },
  { icon: EmailIcon, label: 'Email', url: 'mailto:hydrombee@gmail.com' },
]

const CREATORS: Creator[] = [
  { roleKey: 'frontend', displayName: 'Alexey', links: CREATOR_LINKS },
  { roleKey: 'backend', displayName: 'Aleksei', links: CREATOR_LINKS },
  { roleKey: 'designer', displayName: 'Alex', links: CREATOR_LINKS },
]

/**
 * Содержимое раздела «Creators».
 */
export function CreatorsContent() {
  const { t } = useTranslation()

  const roleLabels: Record<CreatorRoleKey, string> = {
    frontend: t('settings.sections.creators.roles.frontend'),
    backend: t('settings.sections.creators.roles.backend'),
    designer: t('settings.sections.creators.roles.designer'),
  }

  return (
    <div className={styles['creators']}>
      {CREATORS.map((creator) => (
        <div key={creator.roleKey} className={styles['creators__group']}>
          <p className={styles['creators__role']}>{roleLabels[creator.roleKey]}</p>
          <UserRow
            displayName={creator.displayName}
            avatarUrl={CREATOR_AVATAR_URL}
            action={
              <div className={styles['creators__links']}>
                {creator.links.map(({ icon: Icon, label, url }) => (
                  <Tooltip key={label} title={label}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles['creators__link']}
                      aria-label={label}
                    >
                      <Icon />
                    </a>
                  </Tooltip>
                ))}
              </div>
            }
          />
        </div>
      ))}
    </div>
  )
}
