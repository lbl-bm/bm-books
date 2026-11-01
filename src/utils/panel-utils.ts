function updatePanel(panel: HTMLElement, open: boolean): void {
  panel.classList.toggle('float-panel-closed', !open)
  panel.inert = !open
  panel.setAttribute('aria-hidden', String(!open))
  document.querySelectorAll<HTMLElement>('[aria-controls]').forEach(trigger => {
    if (trigger.getAttribute('aria-controls') === panel.id && trigger.hasAttribute('aria-expanded')) {
      trigger.setAttribute('aria-expanded', String(open))
    }
  })
}

export function setPanelOpen(
  id: string,
  open: boolean,
  options: { focusFirst?: boolean; restoreFocus?: boolean } = {},
): void {
  const panel = document.getElementById(id)
  if (!panel) return
  if (open) {
    document.querySelectorAll<HTMLElement>('[data-floating-panel]').forEach(other => {
      if (other !== panel) updatePanel(other, false)
    })
  }
  updatePanel(panel, open)
  if (open && options.focusFirst) {
    requestAnimationFrame(() => {
      if (!panel.inert) panel.querySelector<HTMLElement>('input, button, a[href], select, textarea')?.focus()
    })
  }
  if (!open && options.restoreFocus) {
    Array.from(document.querySelectorAll<HTMLElement>(`[aria-controls="${id}"]`))
      .find(trigger => trigger.getClientRects().length > 0)?.focus()
    // Focusing a search input can open its panel; Escape must leave it closed.
    updatePanel(panel, false)
  }
}

export function togglePanel(id: string, focusFirst = false): void {
  const panel = document.getElementById(id)
  if (panel) setPanelOpen(id, panel.classList.contains('float-panel-closed'), { focusFirst })
}

export function initializeFloatingPanels(): () => void {
  const onClick = (event: MouseEvent): void => {
    if (!(event.target instanceof Element)) return
    const target = event.target
    document.querySelectorAll<HTMLElement>('[data-floating-panel]').forEach(panel => {
      if (panel.classList.contains('float-panel-closed')) return
      const trigger = target.closest('[aria-controls]')
      if (trigger?.getAttribute('aria-controls') === panel.id) return
      if (!panel.contains(target) || target.closest('a[href]')) updatePanel(panel, false)
    })
  }
  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return
    const panel = document.querySelector<HTMLElement>('[data-floating-panel]:not(.float-panel-closed)')
    if (!panel) return
    event.preventDefault()
    setPanelOpen(panel.id, false, { restoreFocus: true })
  }
  document.addEventListener('click', onClick)
  document.addEventListener('keydown', onKeydown)
  return () => {
    document.removeEventListener('click', onClick)
    document.removeEventListener('keydown', onKeydown)
  }
}
