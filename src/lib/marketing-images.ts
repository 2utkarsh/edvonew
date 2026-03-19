export function getCourseArtwork(title: string) {
  const token = title.toLowerCase();

  if (token.includes('mba') || token.includes('management') || token.includes('business') || token.includes('branding') || token.includes('stakeholder') || token.includes('deep work')) {
    return '/images/courses/management.svg';
  }

  if (token.includes('excel') || token.includes('power bi') || token.includes('sql') || token.includes('analytics') || token.includes('pandas')) {
    return '/images/courses/data-science.svg';
  }

  if (token.includes('cloud') || token.includes('devops')) {
    return '/images/courses/cloud-devops.svg';
  }

  if (token.includes('mobile')) {
    return '/images/courses/mobile-development.svg';
  }

  if (token.includes('web')) {
    return '/images/courses/web-development.svg';
  }

  if (token.includes('ai') || token.includes('machine learning') || token.includes('deep learning') || token.includes('python') || token.includes('gen ai') || token.includes('data science')) {
    return '/images/courses/computer-science.svg';
  }

  return '/images/courses/computer-science.svg';
}

export function getProfileArtwork(name: string) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `/images/profiles/${normalized}.svg`;
}
