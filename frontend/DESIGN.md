# Orbit design system

## Direction

Orbit is a calm workspace for planning and completing work. The interface uses neutral surfaces, precise typography, and restrained blue accents. Status colors carry meaning; decoration never substitutes for information. All counts, charts, member names, and task details come from the existing workspace store.

The previous interface had weak separation between navigation and content, crowded filters, competing card metadata, and inconsistent settings controls. This redesign establishes a shared hierarchy across Board, Dashboard, Backlog, Archive, Settings, sprints, and dialogs.

## Theme and typography

- **Light:** off-white canvas, white cards, pale gray navigation, blue actions.
- **Dark:** deep charcoal canvas, raised neutral graphite cards, softened text, periwinkle-blue actions. Surface separation relies on borders and tonal differences rather than heavy shadows.
- **Typography:** locally hosted variable DM Sans, loaded with `next/font/local`. The browser makes no external font request. Page titles are 28–34 px; section titles 16 px; body text 14 px; metadata 11–12 px. Numeric summaries use tabular figures.
- **Preference:** Light, Dark, or System, persisted under `orbit-theme`. Theme initialization runs before hydration. Workspace accent settings customize the project identity badge without changing semantic status colors.

Palette tokens live in `src/app/globals.css`. DaisyUI theme blocks define the base component palette; `@theme` and the dark selector define application-specific semantic tokens. Prefer tokens over literal colors in components.

| Purpose                          | Token / component                      |
| -------------------------------- | -------------------------------------- |
| Page background                  | `canvas`                               |
| Navigation                       | `sidebar`                              |
| Cards, dialogs, menus            | `base-100`                             |
| Column wells and quiet sections  | `panel-soft`, `sunken`                 |
| Primary and secondary text       | `base-content`, `subtle`, `subtlest`   |
| Borders and control boundaries   | `line`, `line-input`                   |
| Selected navigation and filters  | `selected`, `primary`                  |
| Focus indication                 | `focus`                                |
| Status badges                    | Paired `tint-*` / `tint-*-text` tokens |
| Error, success, warning messages | Paired semantic background/text tokens |

Controls use a 10 px radius, task cards 14 px, and larger panels 16 px. Use the 4 px spacing scale; standard panel padding is 20–28 px. Shadows are reserved for raised cards, menus, and dialogs.

## Shared components

- `.ui-panel`: consistent bordered surface for summaries, settings, lists, and planning.
- `.ui-button`: primary, secondary, subtle, destructive, selected, compact, and icon variants. Use these in preference to unrelated button systems.
- `.ui-field`: fields with visible boundaries, focus rings, error states, and touch-friendly sizing.
- `.ui-lozenge`: compact status and epic badges. Status always has a text label, not only a color.
- `PageHeader`: project breadcrumb, title, and brief screen-specific guidance.
- `DialogPanel`: shared modal surface, title, close control, and scrollable form layout.
- `ThemeSelect`, `AnimatedProgress`, `Avatar`, and `SectionMessage`: shared behavior and visual treatment.

## Layout and interaction

The desktop sidebar is 240 px wide and can collapse. Mobile/tablet navigation uses an Ark UI dialog for focus trapping, Escape handling, background scroll locking, and focus return. Archive is directly accessible; Backlog navigation explicitly names sprint planning.

Board columns retain a comfortable minimum reading width and scroll horizontally on narrow screens, with scroll snapping. Task identifiers and priority are above the title; epic and label context follow; dates, subtask progress, and assignees sit in the footer. Drag handles remain separate from the task-opening control. Motion never applies layout transforms to the draggable wrapper.

Search and assignee filtering stay visible. Other filters are behind a disclosure with an active count; all existing filters, sorting, and clear behavior remain available. The filter toolbar stacks on narrower screens. The assignee selector accommodates the full member catalog instead of growing an unbounded row of avatars.

The dashboard combines related totals into one summary surface, then separates completion, workflow distribution, history, and epic progress. Settings use the same controls and surfaces as task workflows. Dates, archive actions, sprint controls, subtasks, validation, and storage logic are preserved.

## Accessibility and motion

- Visible keyboard focus, labeled controls, semantic headings, and a skip link.
- At least 44 px touch targets for shared buttons and fields; fields use 16 px text on coarse pointers.
- Shared text/background pairs are checked for at least 4.5:1 contrast in both themes. This token check does not replace a rendered accessibility audit.
- Framer Motion respects reduced-motion preferences. CSS transitions and animations also honor reduced motion.
- Short page and dialog entrances, subtle card hover elevation, and a sliding active-navigation highlight. No looping decorative animation.

## Validation

Production build (including TypeScript), ESLint, existing business-logic tests, generated theme initialization, and palette contrast checks are run during implementation.

Browser visual and interaction QA remains necessary before release because computer-use permissions were unavailable during this redesign. Check desktop, tablet, and 320/390 px mobile layouts in both themes; long task/project names; all filters; pointer and keyboard drag-and-drop; dialogs and focus return; touch controls; and saved/system theme switching. Automated token checks cannot establish rendered layout quality or replace these interaction checks.
