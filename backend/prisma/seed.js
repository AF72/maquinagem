require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('A limpar matéria-prima existente...');
    await prisma.materiaPrima.deleteMany();

    console.log('A inserir matéria-prima...');
    await Promise.all([
        // Aços
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.0503',
                peso_esp: 7.85,
                ref_din: 'C45',
                ref_bs: '080M46',
                ref_afnor: 'C45',
                ref_une: 'C45k',
                ref_aisi: '1045',
                ref_jis: 'S45C',
                tipo_tt: 'Têmpera e revenido',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.7225',
                peso_esp: 7.85,
                ref_din: '42CrMo4',
                ref_bs: '708M40',
                ref_afnor: '42CD4',
                ref_une: '42CrMo4',
                ref_aisi: '4140',
                ref_jis: 'SCM440',
                tipo_tt: 'Têmpera e revenido',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.7131',
                peso_esp: 7.85,
                ref_din: '16MnCr5',
                ref_bs: '527M20',
                ref_afnor: '16MC5',
                ref_une: '16MnCr5',
                ref_aisi: '5115',
                ref_jis: 'SMnC420',
                tipo_tt: 'Cementação e têmpera',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.3505',
                peso_esp: 7.81,
                ref_din: '100Cr6',
                ref_bs: '535A99',
                ref_afnor: '100C6',
                ref_une: 'F.131',
                ref_aisi: '52100',
                ref_jis: 'SUJ2',
                tipo_tt: 'Têmpera e revenido',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.0037',
                peso_esp: 7.85,
                ref_din: 'St37-2',
                ref_bs: '040A10',
                ref_afnor: 'A37-2',
                ref_une: 'AE235-B',
                ref_aisi: 'A36',
                ref_jis: 'SS400',
                tipo_tt: '',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.1191',
                peso_esp: 7.85,
                ref_din: 'C45E',
                ref_bs: '080M46',
                ref_afnor: 'XC45',
                ref_une: 'C45E',
                ref_aisi: '1045',
                ref_jis: 'S45C',
                tipo_tt: 'Têmpera e revenido',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.2379',
                peso_esp: 7.7,
                ref_din: 'X153CrMoV12',
                ref_bs: 'BD3',
                ref_afnor: 'Z160CDV12',
                ref_une: 'X153CrMoV12',
                ref_aisi: 'X153CrMoV12',
                ref_jis: 'SKD11',
                tipo_tt: 'Têmpera em óleo e revenido',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '1.2311',
                peso_esp: 7.85,
                ref_din: '40CrMnMo7',
                ref_bs: '-',
                ref_afnor: '40CMD8',
                ref_une: '40CrMnMo7',
                ref_aisi: 'P20',
                ref_jis: 'PX5',
                tipo_tt: 'Pré-temperado (fornecido pronto)',
            },
        }),
        // Alumínios
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '3.2315',
                peso_esp: 2.71,
                ref_din: 'EN AW-6082 / AlSi1MgMn',
                ref_bs: 'HE30',
                ref_afnor: 'A-SGM0.7',
                ref_une: 'L-3341',
                ref_aisi: '6082',
                ref_jis: 'A6082',
                tipo_tt: 'Solubilização e envelhecimento (T6)',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '3.4365',
                peso_esp: 2.81,
                ref_din: 'EN AW-7075 / AlZn5.5MgCu',
                ref_bs: 'DTD5024',
                ref_afnor: 'A-Z5GU',
                ref_une: 'L-3372',
                ref_aisi: '7075',
                ref_jis: 'A7075',
                tipo_tt: 'Solubilização e envelhecimento (T651)',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '3.1355',
                peso_esp: 2.78,
                ref_din: 'EN AW-2024 / AlCu4Mg1',
                ref_bs: 'L97',
                ref_afnor: 'A-U4G1',
                ref_une: 'L-3312',
                ref_aisi: '2024',
                ref_jis: 'A2024',
                tipo_tt: 'Solubilização e envelhecimento (T4/T351)',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '3.3547',
                peso_esp: 2.66,
                ref_din: 'EN AW-5083 / AlMg4.5Mn0.7',
                ref_bs: 'N8',
                ref_afnor: 'A-G4.5MC',
                ref_une: 'L-3345',
                ref_aisi: '5083',
                ref_jis: 'A5083',
                tipo_tt: 'Sem tratamento térmico (endurecimento por deformação H111/H321)',
            },
        }),
        // Polímeros
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '-',
                peso_esp: 1.14,
                ref_din: 'PA 6.6 (ISO 1874)',
                ref_bs: 'BS 6089',
                ref_afnor: '-',
                ref_une: '-',
                ref_aisi: '-',
                ref_jis: 'JIS K 6920',
                tipo_tt: 'Sem tratamento térmico (termoplástico)',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '-',
                peso_esp: 1.41,
                ref_din: 'POM-C (ISO 9988)',
                ref_bs: '-',
                ref_afnor: '-',
                ref_une: '-',
                ref_aisi: '-',
                ref_jis: '-',
                tipo_tt: 'Sem tratamento térmico (termoplástico)',
            },
        }),
        prisma.materiaPrima.create({
            data: {
                ref_wnr: '-',
                peso_esp: 2.2,
                ref_din: 'PTFE (ISO 13000)',
                ref_bs: '-',
                ref_afnor: '-',
                ref_une: '-',
                ref_aisi: '-',
                ref_jis: '-',
                tipo_tt: 'Sem tratamento térmico (termoplástico)',
            },
        }),
    ]);

    console.log('\nSeed concluído — 15 matérias-prima inseridas.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
