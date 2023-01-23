import { createElem } from '../utilities';

export default class Footer {
  drawFooter(parent: HTMLElement): void {
    const links = createElem('div', 'footer__links');
    const githubLink = createElem('a', 'footer__element github', links) as HTMLAnchorElement;
    githubLink.href = 'https://github.com/EvgeniaM6';
    createElem('div', 'github__img', githubLink);
    createElem('div', 'footer__element year-app', links, '2023');
    const logoCourse = createElem('a', 'footer__element logo-course', links) as HTMLAnchorElement;
    logoCourse.href = 'https://rs.school/js/';
    createElem('div', 'logo-course__img', logoCourse);

    parent.append(links);
  }
}
