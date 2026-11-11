import React from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiArchive, FiBox, FiCheck, FiSearch } from "react-icons/fi";
import SoventoryIcon from "../logo/plussegaush.png";

const highlights = [
    {
        number: "01",
        icon: FiBox,
        title: "Des fiches complètes",
        description: "Modèle, numéro de série, date d’achat, prix et garantie pour chaque équipement.",
    },
    {
        number: "02",
        icon: FiSearch,
        title: "Une localisation claire",
        description: "Filtrez par lieu, état ou catégorie pour retrouver le matériel recherché.",
    },
    {
        number: "03",
        icon: FiArchive,
        title: "Actif ou archivé",
        description: "Consultez séparément le matériel en service et les équipements archivés.",
    },
];

export default function Landing() {
    return (
        <main className="landing-page">
            <nav className="landing-nav" aria-label="Navigation principale">
                <Link className="landing-brand" to="/" aria-label="Soventory, accueil">
                    <img className="brand-mascot" src={SoventoryIcon} alt="" />
                    <span>Soventory</span>
                </Link>
                <div className="landing-nav-links">
                    <a href="#fonctionnalites">Fonctionnalités</a>
                    <Link className="landing-login-link" to="/connexion">Se connecter <FiArrowUpRight /></Link>
                </div>
            </nav>

            <section className="landing-hero">
                <div className="landing-hero-copy">
                    <span className="landing-kicker"><span /> L’INVENTAIRE DE VOTRE PARC MATÉRIEL</span>
                    <h1>Chaque équipement.<br /><em>À sa place.</em></h1>
                    <p className="landing-intro">
                        Consultez l’emplacement, l’état, le numéro de série et la garantie de chaque équipement dans un seul inventaire.
                    </p>
                    <div className="landing-actions">
                        <Link className="landing-primary-button" to="/connexion">Accéder à mon espace <FiArrowUpRight /></Link>
                        <a className="landing-text-link" href="#fonctionnalites">Découvrir Soventory <span>↓</span></a>
                    </div>
                    <div className="landing-proof">
                        <span className="landing-proof-icon"><FiCheck /></span>
                        <span>Équipements · Lieux · Garanties</span>
                    </div>
                </div>

                <div className="landing-visual" aria-label="Aperçu de l’inventaire Soventory">
                    <div className="landing-visual-caption"><span>EXEMPLE D’INVENTAIRE</span><span>APERÇU 01 / 03</span></div>
                    <div className="inventory-preview">
                        <div className="preview-heading">
                            <div>
                                <span className="preview-overline">SUIVI DU PARC</span>
                                <h2>Inventaire</h2>
                            </div>
                            <span className="preview-count">03 éléments</span>
                        </div>
                        <div className="preview-toolbar">
                            <span><FiSearch /> Rechercher un équipement</span>
                            <span>Filtrer <span className="preview-filter-icon">⌄</span></span>
                        </div>
                        <div className="preview-table">
                            <div className="preview-row preview-table-head">
                                <span>ÉQUIPEMENT</span><span>EMPLACEMENT</span><span>ÉTAT</span>
                            </div>
                            <div className="preview-row">
                                <span className="preview-item"><i className="preview-item-icon">01</i><span><b>MacBook Pro</b><small>MP-14 · Informatique</small></span></span>
                                <span>Studio</span><span><i className="status-dot status-ready" />En service</span>
                            </div>
                            <div className="preview-row">
                                <span className="preview-item"><i className="preview-item-icon preview-item-blue">02</i><span><b>Écran Dell</b><small>U2723QE · Écran</small></span></span>
                                <span>Bureau 02</span><span><i className="status-dot status-ready" />En service</span>
                            </div>
                            <div className="preview-row">
                                <span className="preview-item"><i className="preview-item-icon preview-item-rose">03</i><span><b>Appareil photo</b><small>Alpha 7 · Image</small></span></span>
                                <span>Réserve</span><span><i className="status-dot status-check" />À vérifier</span>
                            </div>
                        </div>
                        <div className="preview-footer"><span>Vue d’ensemble</span><span>01 <i /> 03</span></div>
                    </div>
                    <div className="landing-visual-note"><span>01</span> Équipement, lieu et état au même endroit.</div>
                </div>
                <span className="landing-hero-index" aria-hidden="true">SV / 01</span>
            </section>

            <section className="landing-features" id="fonctionnalites">
                <div className="landing-section-heading">
                    <span className="landing-kicker"><span /> LES INFORMATIONS ESSENTIELLES</span>
                    <h2>Le matériel suivi.<br /><em>Les infos retrouvées.</em></h2>
                </div>
                <div className="landing-feature-list">
                    {highlights.map(({ number, icon: Icon, title, description }) => (
                        <article className="landing-feature" key={number}>
                            <div className="landing-feature-top"><span>{number}</span><Icon /></div>
                            <h3>{title}</h3>
                            <p>{description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="landing-cta">
                <div>
                    <span className="landing-kicker"><span /> ACCÈS À VOTRE PARC</span>
                    <h2>Consultez votre<br /><em>inventaire.</em></h2>
                </div>
                <Link className="landing-primary-button" to="/connexion">Accéder à l’inventaire <FiArrowUpRight /></Link>
            </section>

            <footer className="landing-footer">
                <Link className="landing-brand" to="/"><img className="brand-mascot" src={SoventoryIcon} alt="" /><span>Soventory</span></Link>
                <span>Suivi du matériel, des lieux et des garanties.</span>
                <span>© {new Date().getFullYear()} Soventory</span>
            </footer>
        </main>
    );
}
