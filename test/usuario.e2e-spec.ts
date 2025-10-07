/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';

// Todo teste/arquivo de teste tem um describe, que cria um novo suite de testes
describe('Testes dos Módulos Usuário e Auth (e2e)', () => {
  let token: any;
  let app: INestApplication<App>;
  let usuarioId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          /* Nessa linha, estou dizendo "a partir dessa pasta (./), suba 1 pasta (../), depois entre na pasta src, 
          encontre qualquer coisa que tenha a pasta entities, entre na pasta entities 
          pegue todos os arquivos que sejam algumacoisa.entity.ts" */
          entities: [__dirname + './../src/**/entities/*entity.ts'],
          synchronize: true,
          // Isso garante que o banco de dados seja recriado a cada teste, usar só em testes
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Se não colocar isso, deixa de testar as validações, como @IsNotEmpty, @IsEmail, @MinLength, etc
    app.useGlobalPipes(new ValidationPipe());

    // Essa linha abaixo é para conectar ao banco de dados
    await app.init();
  });

  // "Depois de tudo", ou seja, depois de todos os testes
  afterAll(async () => {
    // Fecha a conexão com o banco de dados
    await app.close();
  });

  // Aqui começam os testes, cada teste tem um "it"
  // É uma boa prática numerar e descrever o que o teste faz
  it('01 - Deve cadastrar um novo usuário', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(201);

    usuarioId = resposta.body.id;
  });

  it('02 - Não Deve Cadastrar um Usuário Duplicado', async () => {
    return await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(400);
  });

  it('03 - Deve Autenticar o Usuário (Login)', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/logar')
      .send({
        usuario: 'root@root.com',
        senha: 'rootroot',
      })
      .expect(200);

    token = resposta.body.token;
  });

  it('04 - Deve Listar Todos os Usuários', async () => {
    return request(app.getHttpServer())
      .get('/usuarios/all')
      .set('Authorization', `${token}`)
      .expect(200);
  });

  it('05 - Deve Atualizar um Usuário', async () => {
    return request(app.getHttpServer())
      .put('/usuarios/atualizar')
      .set('Authorization', `${token}`)
      .send({
        id: usuarioId,
        nome: 'John Doe',
        usuario: 'johndoe@root.com',
        senha: 'password123',
        foto: '-',
      })
      .expect(200)
      .then((resposta) => {
        expect('John Doe').toEqual(resposta.body.nome);
      });
  });
});
