/**
 * Utilitários genéricos para a aplicação
 */

/**
 * Gera um nickname a partir de um nome
 * @param nome - Nome para gerar o nickname
 * @returns Nickname gerado
 */
export function generateNickname(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais exceto espaços e hífens
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens do início e fim
}

/**
 * Verifica se um nickname já existe em uma tabela e retorna um nickname único
 * @param baseNickname - Nickname base
 * @param checkFunction - Função que verifica se o nickname existe
 * @returns Nickname único
 */
export async function ensureUniqueNickname(
  baseNickname: string,
  checkFunction: (nickname: string) => Promise<boolean>
): Promise<string> {
  let counter = 1;
  let finalNickname = baseNickname;
  
  while (await checkFunction(finalNickname)) {
    finalNickname = `${baseNickname}-${counter}`;
    counter++;
  }
  
  return finalNickname;
}