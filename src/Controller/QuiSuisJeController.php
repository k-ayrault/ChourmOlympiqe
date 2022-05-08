<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
/**
 * @Route("/jeux/qsj")
 */
class QuiSuisJeController extends AbstractController
{
    /**
     * @Route("/", name="app_qui_suis_je")
     */
    public function index(): Response
    {
        return $this->render('/jeux/qui_suis_je/index.html.twig', [
            'controller_name' => 'QuiSuisJeController',
        ]);
    }
    /**
     * @Route("/start", name="app_qui_suis_je_start")
     */
    public function start(): Response
    {
        return $this->render('/jeux/qui_suis_je/index.html.twig', [
            'controller_name' => 'QuiSuisJeController',
        ]);
    }
}
