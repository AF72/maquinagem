'use strict';

/* ---------- Ícones ---------- */

function IconPencil() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1.05 0 0 1.05 12 12)">
                <path style={{ fill: 'currentColor' }} transform="translate(-12.5, -11.5)"
                    d="M 19.171875 2 C 18.448125 2 17.724375 2.275625 17.171875 2.828125 L 16 4 L 20 8 L 21.171875 6.828125 C 22.275875 5.724125 22.275875 3.933125 21.171875 2.828125 C 20.619375 2.275625 19.895625 2 19.171875 2 z M 14.5 5.5 L 5 15 C 5 15 6.005 15.005 6.5 15.5 C 6.995 15.995 6.984375 16.984375 6.984375 16.984375 C 6.984375 16.984375 8.004 17.004 8.5 17.5 C 8.996 17.996 9 19 9 19 L 18.5 9.5 L 14.5 5.5 z M 3.6699219 17 L 3.0136719 20.503906 C 2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328 L 7 20.330078 L 3.6699219 17 z" />
            </g>
        </svg>
    );
}

function IconUserPlus() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1 0 0 1 12 12)">
                <g transform="matrix(1 0 0 1 -3 -5)">
                    <circle stroke="rgb(33,33,33)" strokeWidth="2" fill="none" cx="0" cy="0" r="4" />
                </g>
                <g transform="matrix(1 0 0 1 -3 6)">
                    <path stroke="rgb(33,33,33)" strokeWidth="2" fill="none" strokeLinecap="round"
                        transform="translate(-9, -18)"
                        d="M 3 21 L 3 19 C 3 16.79 4.79 15 7 15 L 11 15 C 13.21 15 15 16.79 15 19 L 15 21" />
                </g>
                <g transform="matrix(1 0 0 1 7 -1)">
                    <path stroke="rgb(33,33,33)" strokeWidth="2" fill="none" strokeLinecap="round"
                        transform="translate(-19, -11)"
                        d="M 16 11 L 22 11 M 19 8 L 19 14" />
                </g>
            </g>
        </svg>
    );
}

/* ---------- Componentes auxiliares ---------- */

function Avatar({ name, cls, small = false }) {
    return (
        <span className={`avatar ${cls}${small ? ' av-sm' : ''}`}>
            {window.initials(name)}
        </span>
    );
}

function NameCell({ name, cls }) {
    return (
        <span className="inline-flex">
            <Avatar name={name} cls={cls} />
            {name}
        </span>
    );
}

/* ---------- Linhas da tabela ---------- */

function ColabRow({ colab, pedidos }) {
    const pedC = pedidos.filter(p => p.clienteTipo === 'colaborador' && p.clienteId === colab.id).length;
    return (
        <tr className="row-colab">
            <td></td>
            <td style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="10" height="10" viewBox="0 0 10 10"
                    style={{ marginLeft: 4, flexShrink: 0 }}
                    title={colab.ativo !== false ? 'Ativo' : 'Inativo'}>
                    <circle cx="5" cy="5" r="5" fill={colab.ativo !== false ? '#4caf50' : '#f44336'} />
                </svg>
                <NameCell name={colab.nome} cls="av-colab" />
            </td>
            <td></td>
            <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{colab.tel || '—'}</td>
            <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{colab.email || '—'}</td>
            <td>—</td>
            <td>{pedC}</td>
            <td>
                <button className="btn btn-ghost btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => window.openModal('editColaborador', colab.id)}>
                    <IconPencil />
                </button>
            </td>
        </tr>
    );
}

function EmpresaRow({ empresa, colaboradores, pedidos, expanded }) {
    const colabs = colaboradores.filter(c => c.empresaId === empresa.id);
    const pedEmp = pedidos.filter(p =>
        p.clienteTipo === 'colaborador' && colabs.some(c => c.id === p.clienteId)
    ).length;
    const exp = expanded['e' + empresa.id];

    return (
        <>
            <tr className="row-empresa">
                <td>
                    <button className="expand-btn"
                        onClick={() => window.toggleEmpresa(empresa.id)}
                        style={{ fontSize: '1.25rem' }}>
                        {exp ? '▼' : '▶'}
                    </button>
                </td>
                <td><NameCell name={empresa.nome} cls="av-empresa" /></td>
                <td><span className="badge badge-teal">Empresa</span></td>
                <td>{empresa.tel || '—'}</td>
                <td>{empresa.email || '—'}</td>
                <td>{empresa.nif || '—'}</td>
                <td>{pedEmp}</td>
                <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                            onClick={() => window.openModal('editEmpresa', empresa.id)}>
                            <IconPencil />
                        </button>
                        <button className="btn btn-ghost btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                            onClick={() => window.openModal('colaborador', empresa.id)}>
                            <IconUserPlus />
                        </button>
                    </div>
                </td>
            </tr>
            {exp && colabs.map(c =>
                <ColabRow key={c.id} colab={c} pedidos={pedidos} />
            )}
        </>
    );
}

function ParticularRow({ particular, pedidos }) {
    const pedP = pedidos.filter(p => p.clienteTipo === 'particular' && p.clienteId === particular.id).length;
    return (
        <tr>
            <td></td>
            <td><NameCell name={particular.nome} cls="av-particular" /></td>
            <td><span className="badge badge-coral">Particular</span></td>
            <td>{particular.tel || '—'}</td>
            <td>{particular.email || '—'}</td>
            <td>{particular.cc || '—'}</td>
            <td>{pedP}</td>
            <td>
                <button className="btn btn-ghost btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => window.openModal('editParticular', particular.id)}>
                    <IconPencil />
                </button>
            </td>
        </tr>
    );
}

/* ---------- Componente principal ---------- */

function ClientesPage({ empresas, colaboradores, particulares, pedidos, expanded, filter }) {
    const showEmpresas = filter === 'todos' || filter === 'empresa';
    const showParticulares = filter === 'todos' || filter === 'particular';
    const semDados = empresas.length === 0 && particulares.length === 0;

    return (
        <>
            <div className="section-header">
                <span className="section-count">
                    {empresas.length} empresas · {colaboradores.length} colaboradores · {particulares.length} particulares
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="filter-tabs">
                        {['todos', 'empresa', 'particular'].map(f => (
                            <div key={f}
                                className={`tab${filter === f ? ' active' : ''}`}
                                onClick={() => window.setClienteFilter(f)}>
                                {f === 'todos' ? 'Todos' : f === 'empresa' ? 'Empresas' : 'Particulares'}
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-primary" onClick={() => window.openModal('novoCliente')}>
                        + Novo cliente
                    </button>
                </div>
            </div>

            <div className="full-card">
                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Telefone</th>
                            <th>E-mail</th>
                            <th>NIF / CC</th>
                            <th>Pedidos</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {showEmpresas && empresas.map(emp =>
                            <EmpresaRow key={emp.id} empresa={emp}
                                colaboradores={colaboradores}
                                pedidos={pedidos}
                                expanded={expanded} />
                        )}
                        {showParticulares && particulares.map(p =>
                            <ParticularRow key={p.id} particular={p} pedidos={pedidos} />
                        )}
                        {semDados && (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                                    Nenhum cliente encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

window.ClientesPage = ClientesPage;
